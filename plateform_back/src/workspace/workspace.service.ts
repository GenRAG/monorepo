import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceRequest } from 'src/workspace/dto/create-workspace.request';
import {
    WorkspaceRepository,
    WorkspaceWithUsers,
    WorkspaceWithUsersAndCreditBalance,
} from 'src/workspace/workspace.repository';

@Injectable()
export class WorkspaceService {
    constructor(private readonly workspaceRepository: WorkspaceRepository) {}

    async create(
        workspaceData: CreateWorkspaceRequest,
        userId: string,
    ): Promise<WorkspaceWithUsers> {
        const { name, description } = workspaceData;

        return this.workspaceRepository.create({ name, description, userId });
    }

    async findAll(userId: string): Promise<WorkspaceWithUsers[]> {
        return this.workspaceRepository.findAll(userId);
    }

    async findOne(
        workspaceId: string,
    ): Promise<WorkspaceWithUsersAndCreditBalance> {
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
