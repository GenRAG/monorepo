import { Injectable, NotFoundException } from '@nestjs/common';
import { Workspace } from 'generated/prisma';
import { CreateWorkspaceRequest } from 'src/workspace/dto/create-workspace.request';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';

@Injectable()
export class WorkspaceService {
    constructor(private readonly workspaceRepository: WorkspaceRepository) {}

    async create(
        workspaceData: CreateWorkspaceRequest,
        userId: string,
    ): Promise<Workspace> {
        const { name, description } = workspaceData;

        return this.workspaceRepository.create({ name, description, userId });
    }

    async findAll(userId: string): Promise<Workspace[]> {
        return this.workspaceRepository.findAll(userId);
    }

    async findOne(workspaceId: string): Promise<Workspace> {
        const workspace = await this.workspaceRepository.findOne(workspaceId);
        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        return workspace;
    }

    async delete(workspaceId: string): Promise<void> {
        const workspace = await this.workspaceRepository.findOne(workspaceId);

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        await this.workspaceRepository.delete(workspaceId);
    }
}
