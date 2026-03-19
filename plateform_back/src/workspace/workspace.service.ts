import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole, Workspace } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkspaceRequest } from 'src/workspace/dto/create-workspace.request';

@Injectable()
export class WorkspaceService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(
        workspaceData: CreateWorkspaceRequest,
        userId: string,
    ): Promise<Workspace> {
        const { name, description } = workspaceData;

        return this.prismaService.workspace.create({
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
    }

    async findAll(userId: string): Promise<Workspace[]> {
        return this.prismaService.workspace.findMany({
            where: {
                users: { some: { userId } },
            },
        });
    }

    async findOne(workspaceId: string): Promise<Workspace> {
        const workspace = await this.prismaService.workspace.findUnique({
            where: { id: workspaceId },
            include: { users: true },
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        return workspace;
    }

    async delete(workspaceId: string): Promise<void> {
        const workspace = await this.prismaService.workspace.findUnique({
            where: { id: workspaceId },
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        await this.prismaService.workspace.delete({
            where: { id: workspaceId },
        });
    }
}
