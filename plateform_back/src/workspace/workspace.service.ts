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

    async getAllWorkspacesForUser(userId: string): Promise<Workspace[]> {
        const workspaces = await this.prismaService.workspace.findMany({
            where: {
                users: {
                    some: {
                        userId,
                    },
                },
            },
            include: { users: true },
        });

        return workspaces;
    }
}
