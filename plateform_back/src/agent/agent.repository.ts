import { Injectable } from '@nestjs/common';
import { AgentStatus } from 'generated/prisma';
import { Agent, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

export type FindAllAgentResult = Prisma.AgentGetPayload<{
    include: {
        deployments: {
            select: { toStatus: true };
        };
    };
}>;

type AgentWithWorkflows = Prisma.AgentGetPayload<{
    include: {
        workflows: {
            where: { isActive: true };
            select: { id: true; definition: true };
        };
    };
}>;

export type FindOneWithActiveWorkflowResult = Omit<AgentWithWorkflows, 'workflows'> & {
    workflow: AgentWithWorkflows['workflows'][number] | null;
};

export type FindProductionDeployedWorkflowVersionResult = {
    workflowVersion: number | null;
};

@Injectable()
export class AgentRepository {
    constructor(private readonly prisma: PrismaService) {}

    findOne(id: string, workspaceId: string): Promise<Agent | null> {
        return this.prisma.agent.findFirst({
            where: { id, workspaceId },
        });
    }

    async findOneWithActiveWorkflow(id: string, workspaceId: string): Promise<FindOneWithActiveWorkflowResult | null> {
        const agent = await this.prisma.agent.findFirst({
            where: { id, workspaceId },
            include: {
                workflows: {
                    where: { isActive: true },
                    select: { id: true, definition: true },
                },
            },
        });

        if (!agent) return null;

        const { workflows, ...rest } = agent;

        if (workflows.length === 0) return { ...rest, workflow: null };

        return { ...rest, workflow: workflows[0] };
    }

    findAll(workspaceId: string): Promise<FindAllAgentResult[]> {
        return this.prisma.agent.findMany({
            where: { workspaceId },
            include: {
                deployments: {
                    orderBy: { version: 'desc' },
                    take: 1,
                    select: { toStatus: true },
                },
            },
        });
    }

    findProductionDeployedWorkflowVersion(
        agentId: string,
    ): Promise<FindProductionDeployedWorkflowVersionResult | null> {
        return this.prisma.agentVersion.findFirst({
            where: { agentId, toStatus: AgentStatus.PRODUCTION },
            orderBy: { version: 'desc' },
            select: { workflowVersion: true },
        });
    }

    update(id: string, data: Prisma.AgentUpdateInput): Promise<Agent> {
        return this.prisma.agent.update({ where: { id }, data });
    }

    delete(id: string): Promise<Agent> {
        return this.prisma.agent.delete({ where: { id } });
    }

    transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(fn);
    }
}
