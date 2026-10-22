import { Injectable } from '@nestjs/common';
import { Prisma, Workspace, PlanTier, CreditTransactionType, UserWorkspace } from 'generated/prisma';
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
                        isActive: true;
                    };
                };
                datasets: {
                    select: {
                        datasetId: true;
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
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                creditBalance: { select: { balance: true } },
                agents: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        createdAt: true,
                        workflows: { select: { id: true, isActive: true } },
                        datasets: { select: { datasetId: true } },
                    },
                },
            },
        });
    }

    async findAll(userId: string): Promise<WorkspaceWithUsers[]> {
        return this.prisma.workspace.findMany({
            where: { users: { some: { userId } } },
            include: { users: true },
        });
    }

    /**
     * One workspace per user, enforced here: the per-user advisory lock serializes concurrent creations, so
     * the check and the insert cannot interleave (each creation grants the plan's initial credits).
     * Returns null when the user already has a workspace.
     */
    async create(data: {
        name: string;
        description?: string;
        userId: string;
        plan: PlanTier;
    }): Promise<WorkspaceWithUsers | null> {
        const { name, description, userId, plan } = data;
        const { initialCredits } = getPlanConfig(plan);

        return this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
            if ((await tx.userWorkspace.count({ where: { userId } })) > 0) return null;

            const workspace = await tx.workspace.create({
                data: {
                    name,
                    description,
                    plan,
                    users: { create: { userId } },
                    creditBalance: { create: { balance: initialCredits } },
                },
                include: { users: true },
            });

            if (initialCredits > 0) {
                await tx.creditTransaction.create({
                    data: {
                        workspaceId: workspace.id,
                        amount: initialCredits,
                        type: CreditTransactionType.SUBSCRIPTION,
                        metadata: { plan, reason: 'initial_plan_credits' },
                    },
                });
            }

            return workspace;
        });
    }

    async updateName(id: string, name: string): Promise<Workspace> {
        return this.prisma.workspace.update({ where: { id }, data: { name } });
    }

    async findPlanUsage(id: string): Promise<{ plan: PlanTier; agents: number; datasets: number } | null> {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id },
            select: { plan: true, _count: { select: { agents: true, datasets: true } } },
        });
        return workspace && { plan: workspace.plan, ...workspace._count };
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.workspace.count({ where: { id } })) > 0;
    }

    async findMembership(userId: string, workspaceId: string): Promise<UserWorkspace | null> {
        return this.prisma.userWorkspace.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } },
        });
    }
}
