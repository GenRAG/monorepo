import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentRequest } from './dto/create-agent.request';
import { UpdateAgentRequest } from './dto/update-agent.request';
import { Agent, Prisma } from 'generated/prisma';
import { AgentRepository, FindAllAgentResult } from 'src/agent/agent.repository';

@Injectable()
export class AgentService {
    constructor(private readonly agentRepository: AgentRepository) {}

    async insertOne(createAgentRequest: CreateAgentRequest, userId: string, workspaceId: string): Promise<Agent> {
        return this.agentRepository.transaction(async (tx) => {
            const agent = await tx.agent.create({
                data: {
                    name: createAgentRequest.name,
                    description: createAgentRequest.description ?? 'Pas de description pour le moment',
                    createdBy: userId,
                    updatedBy: userId,
                    workspace: { connect: { id: workspaceId } },
                },
            });

            if (createAgentRequest.workflow) {
                await tx.workflow.create({
                    data: {
                        agentId: agent.id,
                        definition: createAgentRequest.workflow.definition as Prisma.InputJsonValue,
                        version: 1,
                        isActive: true,
                    },
                });
            }

            return agent;
        });
    }

    async findAll(workspaceId: string): Promise<FindAllAgentResult[]> {
        return this.agentRepository.findAll(workspaceId);
    }

    async findOne(id: string, workspaceId: string): Promise<Agent> {
        const agent = await this.agentRepository.findOne(id, workspaceId);
        if (!agent) throw new NotFoundException('Agent not found');
        return agent;
    }

    async update(id: string, updateAgentDto: UpdateAgentRequest, userId: string): Promise<Agent> {
        try {
            return await this.agentRepository.update(id, { ...updateAgentDto, updatedBy: userId });
        } catch (_e: any) {
            throw new NotFoundException('Agent not found');
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.agentRepository.delete(id);
        } catch (_e: any) {
            throw new NotFoundException('Agent not found');
        }
    }

    async findProductionWorkflowVersion(agentId: string): Promise<number | null> {
        const deployment = await this.agentRepository.findProductionDeployedWorkflowVersion(agentId);
        return deployment?.workflowVersion ?? null;
    }
}
