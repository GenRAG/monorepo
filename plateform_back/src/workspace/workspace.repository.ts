import { Injectable } from '@nestjs/common';
import { UserRole, Prisma, Workspace } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

export type WorkspaceWithUsersAndCreditBalance = Prisma.WorkspaceGetPayload<{
    include: {
        users: { select: { role: true } };
        creditBalance: { select: { balance: true } };
    };
}>;

export type WorkspaceWithUsers = Prisma.WorkspaceGetPayload<{
    include: { users: true };
}>;

@Injectable()
export class WorkspaceRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(
        id: string,
    ): Promise<WorkspaceWithUsersAndCreditBalance | null> {
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
    }): Promise<WorkspaceWithUsers> {
        const { name, description, userId } = data;

        const workspace = await this.prisma.workspace.create({
            data: {
                name,
                description,
                users: {
                    create: {
                        userId,
                        role: UserRole.ADMIN,
                    },
                },
                creditBalance: {
                    create: {
                        balance: 0,
                    },
                },
            },
            include: {
                users: true,
                creditBalance: true,
            },
        });

        return workspace;
    }

    async delete(id: string): Promise<Workspace> {
        return this.prisma.workspace.delete({
            where: { id },
        });
    }
}
