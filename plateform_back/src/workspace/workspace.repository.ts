import { Injectable } from '@nestjs/common';
import {
    UserRole,
    Prisma,
    Workspace,
    PlanTier,
    CreditTransactionType,
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
}
