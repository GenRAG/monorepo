import { Injectable } from '@nestjs/common';
import { AgentStatus, AgentVersion } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeploymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    findAll(agentId: string) {
        return this.prisma.agentVersion.findMany({
            where: { agentId },
            orderBy: { version: 'desc' },
        });
    }

    findOne(id: string, agentId: string) {
        return this.prisma.agentVersion.findFirst({
            where: { id, agentId },
            include: {
                createdByUser: {
                    select: { id: true, name: true },
                },
            },
        });
    }

    findLatest(agentId: string): Promise<AgentVersion | null> {
        return this.prisma.agentVersion.findFirst({
            where: { agentId },
            orderBy: { version: 'desc' },
        });
    }

    async createWithAgentUpdate(data: {
        agentId: string;
        fromStatus: AgentStatus;
        toStatus: AgentStatus;
        name?: string;
        changelog?: string;
        workflowVersion?: number;
        userId: string;
    }): Promise<AgentVersion> {
        return this.prisma.$transaction(async (tx) => {
            await tx.agent.update({
                where: { id: data.agentId },
                data: { updatedBy: data.userId, status: data.toStatus },
            });

            const last = await tx.agentVersion.findFirst({
                where: { agentId: data.agentId },
                orderBy: { version: 'desc' },
            });

            return tx.agentVersion.create({
                data: {
                    agentId: data.agentId,
                    version: last ? last.version + 1 : 1,
                    name: data.name ?? 'Deployment',
                    changelog: data.changelog,
                    fromStatus: data.fromStatus,
                    toStatus: data.toStatus,
                    workflowVersion: data.workflowVersion ?? null,
                    createdBy: data.userId,
                },
            });
        });
    }
}
