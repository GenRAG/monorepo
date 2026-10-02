import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentRequest } from './dto/create-agent.request';
import { UpdateAgentRequest } from './dto/update-agent.request';
import { Agent, Prisma } from 'generated/prisma';
import { AgentListItem, AgentRepository } from 'src/agent/agent.repository';

// Only "record to update/delete not found" means 404: any other failure (DB down, constraint…) must surface as a
// 5xx and reach Sentry instead of being disguised as a missing agent.
const toNotFoundIfMissing = (e: unknown): unknown =>
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025'
        ? new NotFoundException('Agent not found')
        : e;

@Injectable()
export class AgentService {
    constructor(private readonly agentRepository: AgentRepository) {}

    async insertOne(createAgentRequest: CreateAgentRequest, userId: string, workspaceId: string): Promise<Agent> {
        return this.agentRepository.transaction(async (tx) => {
            const agent = await tx.agent.create({
                data: {
                    name: createAgentRequest.name.trim(),
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

    async findAll(workspaceId: string): Promise<AgentListItem[]> {
        const agents = await this.agentRepository.findAll(workspaceId);
        return agents.map(({ deployments: _deployments, _count, ...agent }) => ({
            ...agent,
            documentsCount: _count.documents,
        }));
    }

    async findOne(id: string, workspaceId: string): Promise<Agent> {
        const agent = await this.agentRepository.findOne(id, workspaceId);
        if (!agent) throw new NotFoundException('Agent not found');
        return agent;
    }

    async update(id: string, updateAgentDto: UpdateAgentRequest, userId: string): Promise<Agent> {
        try {
            const name = updateAgentDto.name?.trim();
            return await this.agentRepository.update(id, {
                ...updateAgentDto,
                ...(name !== undefined && { name }),
                updatedBy: userId,
            });
        } catch (e) {
            throw toNotFoundIfMissing(e);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.agentRepository.delete(id);
        } catch (e) {
            throw toNotFoundIfMissing(e);
        }
    }

    async findProductionWorkflowVersion(agentId: string): Promise<number | null> {
        const deployment = await this.agentRepository.findProductionDeployedWorkflowVersion(agentId);
        return deployment?.workflowVersion ?? null;
    }
}
