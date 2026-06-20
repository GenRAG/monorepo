import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceRequest } from 'src/workspace/dto/create-workspace.request';
import { WorkspaceStatsService } from 'src/workspace/workspace-stats.service';
import { WorkspaceRepository, WorkspaceWithUsers, WorkspacePayload } from 'src/workspace/workspace.repository';

@Injectable()
export class WorkspaceService {
    constructor(
        private readonly workspaceRepository: WorkspaceRepository,
        private readonly workspaceStatsService: WorkspaceStatsService,
    ) {}

    async create(workspaceData: CreateWorkspaceRequest, userId: string): Promise<WorkspaceWithUsers> {
        const { name, description } = workspaceData;
        return this.workspaceRepository.create({ name, description, userId });
    }

    async findAll(userId: string): Promise<WorkspaceWithUsers[]> {
        return this.workspaceRepository.findAll(userId);
    }

    async findOne(workspaceId: string): Promise<WorkspacePayload> {
        const workspace = await this.workspaceRepository.findOne(workspaceId);
        if (!workspace) throw new NotFoundException('Workspace not found');
        return workspace;
    }

    async delete(workspaceId: string): Promise<void> {
        try {
            await this.workspaceRepository.delete(workspaceId);
        } catch (e: any) {
            if (e?.code === 'P2025') throw new NotFoundException('Workspace not found');
            throw e;
        }
    }

    async getStats(workspaceId: string) {
        if (!(await this.workspaceRepository.exists(workspaceId))) {
            throw new NotFoundException('Workspace not found');
        }
        return this.workspaceStatsService.getStats(workspaceId);
    }

    async getConsumption(workspaceId: string, days: number) {
        if (!(await this.workspaceRepository.exists(workspaceId))) {
            throw new NotFoundException('Workspace not found');
        }
        return this.workspaceStatsService.getConsumption(workspaceId, days);
    }
}
