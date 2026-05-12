import { Injectable } from '@nestjs/common';
import {
    UserRole,
    Prisma,
    Workspace,
    PlanTier,
    CreditTransactionType,
    AgentStatus,
    DocumentStatus,
} from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { getPlanConfig } from 'src/plans/plans.config';

export type WorkspacePayload = Prisma.WorkspaceGetPayload<{
    include: {
        users: {
            include: {
                user: {
                    select: {
                        id: true;
                        name: true;
                        email: true;
                    };
                };
            };
        };
        creditBalance: { select: { balance: true } };
        agents: {
            select: {
                id: true;
                name: true;
                description: true;
                createdAt: true;
                workflows: {
                    select: {
                        id: true;
                        definition: true;
                        isActive: true;
                    };
                };
                documents: {
                    select: {
                        id: true;
                    };
                };
            };
        };
    };
}>;

export type WorkspaceWithUsers = Prisma.WorkspaceGetPayload<{
    include: { users: true };
}>;

@Injectable()
export class WorkspaceRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string): Promise<WorkspacePayload | null> {
        return this.prisma.workspace.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                creditBalance: {
                    select: {
                        balance: true,
                    },
                },
                agents: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        createdAt: true,
                        workflows: {
                            select: {
                                id: true,
                                definition: true,
                                isActive: true,
                            },
                        },
                        documents: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findAll(userId: string): Promise<WorkspaceWithUsers[]> {
        return this.prisma.workspace.findMany({
            where: {
                users: { some: { userId } },
            },
            include: { users: true },
        });
    }

    async create(data: {
        name: string;
        description?: string;
        userId: string;
        plan?: PlanTier;
    }): Promise<WorkspaceWithUsers> {
        const { name, description, userId, plan = PlanTier.FREE } = data;
        const { initialCredits } = getPlanConfig(plan);

        return this.prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: {
                    name,
                    description,
                    plan,
                    users: {
                        create: {
                            userId,
                            role: UserRole.ADMIN,
                        },
                    },
                    creditBalance: {
                        create: {
                            balance: initialCredits,
                        },
                    },
                },
                include: { users: true },
            });

            if (initialCredits > 0) {
                await tx.creditTransaction.create({
                    data: {
                        workspaceId: workspace.id,
                        amount: initialCredits,
                        type: CreditTransactionType.SUBSCRIPTION,
                        metadata: {
                            plan,
                            reason: 'initial_plan_credits',
                        },
                    },
                });
            }

            return workspace;
        });
    }

    async delete(id: string): Promise<Workspace> {
        return this.prisma.workspace.delete({
            where: { id },
        });
    }

    async getAgentStats(workspaceId: string) {
        const [production, development, items] = await this.prisma.$transaction([
            this.prisma.agent.count({
                where: { workspaceId, status: AgentStatus.PRODUCTION },
            }),
            this.prisma.agent.count({
                where: { workspaceId, status: AgentStatus.DEVELOPMENT },
            }),
            this.prisma.agent.findMany({
                where: { workspaceId },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    _count: {
                        select: { conversations: true, documents: true },
                    },
                    deployments: {
                        orderBy: { version: 'desc' },
                        take: 1,
                        select: { version: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
            }),
        ]);
        return { production, development, items };
    }

    async getDocumentStats(workspaceId: string) {
        const [indexed, processing, failed, total] = await this.prisma.$transaction([
            this.prisma.document.count({
                where: {
                    agent: { workspaceId },
                    status: DocumentStatus.INDEXED,
                },
            }),
            this.prisma.document.count({
                where: {
                    agent: { workspaceId },
                    status: DocumentStatus.PROCESSING,
                },
            }),
            this.prisma.document.count({
                where: {
                    agent: { workspaceId },
                    status: DocumentStatus.FAILED,
                },
            }),
            this.prisma.document.count({
                where: { agent: { workspaceId } },
            }),
        ]);
        return { indexed, processing, failed, total };
    }

    async getConversationStats(workspaceId: string, since24h: Date, since30d: Date) {
        const [total, last24h, daily, hourly, recent] = await this.prisma.$transaction([
            this.prisma.conversation.count({ where: { workspaceId } }),
            this.prisma.conversation.count({
                where: { workspaceId, createdAt: { gte: since24h } },
            }),
            this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
            SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::int AS count
            FROM "Conversation"
            WHERE "workspaceId" = ${workspaceId} AND "createdAt" >= ${since30d}
            GROUP BY day ORDER BY day ASC
        `,
            this.prisma.$queryRaw<{ hour: Date; count: bigint }[]>`
            SELECT DATE_TRUNC('hour', "createdAt") AS hour, COUNT(*)::int AS count
            FROM "Conversation"
            WHERE "workspaceId" = ${workspaceId} AND "createdAt" >= ${since24h}
            GROUP BY hour ORDER BY hour ASC
        `,
            this.prisma.conversation.findMany({
                where: { workspaceId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    title: true,
                    createdAt: true,
                    agent: { select: { name: true } },
                },
            }),
        ]);
        return { total, last24h, daily, hourly, recent };
    }

    async getRecentActivity(workspaceId: string) {
        const [docs, deployments] = await this.prisma.$transaction([
            this.prisma.document.findMany({
                where: { agent: { workspaceId } },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    name: true,
                    status: true,
                    createdAt: true,
                    agent: { select: { name: true } },
                },
            }),
            this.prisma.agentVersion.findMany({
                where: {
                    agent: { workspaceId },
                    toStatus: AgentStatus.PRODUCTION,
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    version: true,
                    createdAt: true,
                    agent: { select: { name: true } },
                },
            }),
        ]);

        const recentActivity = [
            ...docs.map((doc) => ({ kind: 'doc' as const, createdAt: doc.createdAt, item: doc })),
            ...deployments.map((deployment) => ({
                kind: 'deployment' as const,
                createdAt: deployment.createdAt,
                item: deployment,
            })),
        ]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);

        return {
            docs: recentActivity.filter((entry) => entry.kind === 'doc').map((entry) => entry.item),
            deployments: recentActivity.filter((entry) => entry.kind === 'deployment').map((entry) => entry.item),
        };
    }

    async getCreditBalance(workspaceId: string) {
        return this.prisma.creditBalance.findUnique({
            where: { workspaceId },
            select: { balance: true },
        });
    }
}
