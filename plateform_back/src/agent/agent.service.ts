import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentRequest } from './dto/create-agent.request';
import { UpdateAgentRequest } from './dto/update-agent.request';
import { Agent, AgentStatus } from 'generated/prisma';
import { AgentRepository } from 'src/agent/agent.repository';
import { AgentStateMachine } from 'src/agent/agent.state-machine';

@Injectable()
export class AgentService {
    constructor(private readonly agentRepository: AgentRepository) {}

    async insertOne(
        createAgentRequest: CreateAgentRequest,
        userId: string,
        workspaceId: string,
    ): Promise<Agent> {
        const agent = await this.agentRepository.create({
            name: createAgentRequest.name,
            description: createAgentRequest.description ?? '',
            createdBy: userId,
            updatedBy: userId,
            status: AgentStatus.DEVELOPMENT,
            workspace: { connect: { id: workspaceId } },
        });

        return agent;
    }

    async findAll(workspaceId: string): Promise<Agent[]> {
        return this.agentRepository.findAll(workspaceId);
    }

    async findOne(id: string, workspaceId: string): Promise<Agent> {
        const agent = await this.agentRepository.findOne(id, workspaceId);

        if (!agent) {
            throw new NotFoundException('Agent not found');
        }

        return agent;
    }

    async update(
        id: string,
        workspaceId: string,
        updateAgentDto: UpdateAgentRequest,
        userId: string,
    ): Promise<Agent> {
        const agent = await this.agentRepository.findOne(id, workspaceId);

        if (!agent) {
            throw new NotFoundException('Agent not found');
        }

        if (updateAgentDto.status && updateAgentDto.status !== agent.status) {
            const machine = new AgentStateMachine(agent.status);

            switch (updateAgentDto.status) {
                case AgentStatus.STAGING:
                    machine.toStaging();
                    break;
                case AgentStatus.PRODUCTION:
                    machine.toProduction();
                    break;
                case AgentStatus.DEVELOPMENT:
                    machine.toDevelopment();
                    break;
                default:
                    throw new NotFoundException('Invalid status');
            }
        }

        return this.agentRepository.update(id, {
            ...updateAgentDto,
            updatedBy: userId,
        });
    }

    async remove(id: string, workspaceId: string): Promise<Agent> {
        const agent = await this.agentRepository.findOne(id, workspaceId);

        if (!agent) {
            throw new NotFoundException('Agent not found');
        }

        return this.agentRepository.delete(id);
    }
}
