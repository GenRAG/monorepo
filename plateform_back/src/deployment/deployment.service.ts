import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AgentStatus } from 'generated/prisma';
import { AgentRepository } from 'src/agent/agent.repository';
import { WorkflowService } from 'src/workflow/workflow.service';
import EventBus from 'src/lib/event-bus';
import {
    AgentDeployedEvent,
    AgentStatusChangedEvent,
} from 'src/events/agent/agent-events';
import { AgentEventType } from 'src/events/agent/agent-events.type';
import { CreateDeploymentRequest } from './dto/create-deployment.request';
import { RollbackDeploymentRequest } from './dto/rollback-deployment.request';
import { DeploymentRepository } from './deployment.repository';

@Injectable()
export class DeploymentService {
    constructor(
        private readonly deploymentRepository: DeploymentRepository,
        private readonly agentRepository: AgentRepository,
        private readonly workflowService: WorkflowService,
    ) {}

    private async createDeploymentAndEmitEvents({
        agentId,
        workspaceId,
        workflowVersion,
        userId,
        name,
        changelog,
    }: {
        agentId: string;
        workspaceId: string;
        workflowVersion: number;
        userId: string;
        name?: string;
        changelog?: string;
    }) {
        const latestDeployment =
            await this.deploymentRepository.findLatest(agentId);
        const currentStatus =
            latestDeployment?.toStatus ?? AgentStatus.DEVELOPMENT;

        const deployment =
            await this.deploymentRepository.createWithAgentUpdate({
                agentId,
                fromStatus: currentStatus,
                toStatus: AgentStatus.PRODUCTION,
                name,
                changelog,
                workflowVersion,
                userId,
            });

        EventBus.emit(
            AgentEventType.STATUS_CHANGED,
            new AgentStatusChangedEvent(
                workspaceId,
                agentId,
                currentStatus,
                AgentStatus.PRODUCTION,
            ),
        );

        EventBus.emit(
            AgentEventType.AGENT_DEPLOYED,
            new AgentDeployedEvent(workspaceId, agentId, deployment.version),
        );

        return deployment;
    }

    async deploy(
        agentId: string,
        workspaceId: string,
        dto: CreateDeploymentRequest,
        userId: string,
    ) {
        const { name, changelog } = dto;

        const agent = await this.agentRepository.findOneWithActiveWorkflow(
            agentId,
            workspaceId,
        );
        if (!agent) throw new NotFoundException('Agent not found');

        const { workflow } = agent;
        if (!workflow)
            throw new BadRequestException('Agent has no active workflow');

        const { version } = await this.workflowService.createSnapshot(agentId, {
            definition: workflow.definition as Record<string, unknown>,
        });

        return this.createDeploymentAndEmitEvents({
            agentId,
            workspaceId,
            workflowVersion: version,
            userId,
            name: name,
            changelog: changelog,
        });
    }

    async rollback(
        agentId: string,
        workspaceId: string,
        dto: RollbackDeploymentRequest,
        userId: string,
    ) {
        const agent = await this.agentRepository.findOne(agentId, workspaceId);
        if (!agent) throw new NotFoundException('Agent not found');

        const target = await this.deploymentRepository.findOne(
            dto.deploymentId,
            agentId,
        );
        if (!target) throw new NotFoundException('Deployment not found');

        if (!target.workflowVersion) {
            throw new BadRequestException(
                'This deployment has no associated workflow version',
            );
        }

        const targetWorkflow = await this.workflowService.findByVersion(
            agentId,
            target.workflowVersion,
        );

        await this.workflowService.update(agentId, {
            definition: targetWorkflow.definition as Record<string, unknown>,
        });

        return this.createDeploymentAndEmitEvents({
            agentId,
            workspaceId,
            workflowVersion: target.workflowVersion,
            userId,
            name: `Restauration de v${target.version}`,
            changelog: dto.changelog ?? `Restauré depuis v${target.version}`,
        });
    }

    async getCurrent(agentId: string, workspaceId: string) {
        const agent = await this.agentRepository.findOneWithActiveWorkflow(
            agentId,
            workspaceId,
        );
        if (!agent) throw new NotFoundException('Agent not found');

        const latestDeployment =
            await this.deploymentRepository.findLatest(agentId);
        const { workflow } = agent;

        return {
            deploymentStatus:
                latestDeployment?.toStatus ?? AgentStatus.DEVELOPMENT,
            name: agent.name,
            latestDeployment,
            activeWorkflow: workflow
                ? {
                      id: workflow.id,
                  }
                : null,
        };
    }

    findAll(agentId: string) {
        return this.deploymentRepository.findAll(agentId);
    }

    async findOne(id: string, agentId: string) {
        const deployment = await this.deploymentRepository.findOne(id, agentId);

        if (!deployment) {
            throw new NotFoundException('Deployment not found');
        }

        return deployment;
    }
}
