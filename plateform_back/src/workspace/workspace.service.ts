import { Injectable } from '@nestjs/common';
import { UserRole, Workspace } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkspaceRequest } from 'src/workspace/dto/create-workspace.request';

@Injectable()
export class WorkspaceService {
    constructor(private readonly prismaService: PrismaService) {}

    async createWorkspace(
        workspaceData: CreateWorkspaceRequest,
        userId: string,
    ): Promise<Workspace> {
        const { name, description } = workspaceData;

        const workspace = await this.prismaService.workspace.create({
            data: {
                name,
                description,
                users: {
                    create: {
                        userId,
                        role: UserRole.ADMIN,
                    },
                },
            },
            include: { users: true },
        });

        if (!workspace) {
            throw new Error('Failed to create workspace');
        }

        return workspace;
    }

    async getAllWorkspacesForUser(userId: string): Promise<
        {
            id: string;
            name: string;
            updatedAt: Date;
        }[]
    > {
        return this.prismaService.workspace.findMany({
            where: {
                users: {
                    some: { userId },
                },
            },
            select: {
                id: true,
                name: true,
                updatedAt: true,
            },
        });
    }

    async getWorkspaceById(
        workspaceId: string,
        userId: string,
    ): Promise<Workspace> {
        const workspace = await this.prismaService.workspace.findUnique({
            where: { id: workspaceId },
            include: { users: true },
        });

        if (!workspace) {
            throw new Error('Workspace not found');
        }

        const userInWorkspace = workspace.users.find(
            (user) => user.userId === userId,
        );

        if (!userInWorkspace) {
            throw new Error('User does not belong to this workspace');
        }

        return workspace;
    }
}
