import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Workspace } from 'generated/prisma';
import { CreateWorkspaceRequest } from 'src/workspace/dto/create-workspace.request';
import { UpdateWorkspaceRequest } from 'src/workspace/dto/update-workspace.request';
import { WorkspaceStatsService } from 'src/workspace/workspace-stats.service';
import { WorkspaceRepository, WorkspaceWithUsers, WorkspacePayload } from 'src/workspace/workspace.repository';

@Injectable()
export class WorkspaceService {
    constructor(
        private readonly workspaceRepository: WorkspaceRepository,
        private readonly workspaceStatsService: WorkspaceStatsService,
    ) {}

    async create(workspaceData: CreateWorkspaceRequest, userId: string): Promise<WorkspaceWithUsers> {
        const { description } = workspaceData;
        const name = this._normalizeName(workspaceData.name);

        // One workspace per user: each creation grants the plan's initial credits.
        if ((await this.workspaceRepository.countByUser(userId)) > 0) {
            throw new ConflictException('User already has a workspace');
        }

        return this.workspaceRepository.create({ name, description, userId });
    }

    async rename(workspaceId: string, { name }: UpdateWorkspaceRequest): Promise<Workspace> {
        try {
            return await this.workspaceRepository.updateName(workspaceId, this._normalizeName(name));
        } catch (e: any) {
            if (e?.code === 'P2025') throw new NotFoundException('Workspace not found');
            throw e;
        }
    }

    private _normalizeName(name: string): string {
        const trimmed = name.trim();
        if (!trimmed) throw new BadRequestException('Workspace name must not be empty');
        return trimmed;
    }

    async findAll(userId: string): Promise<WorkspaceWithUsers[]> {
        return this.workspaceRepository.findAll(userId);
    }

    async findOne(workspaceId: string): Promise<WorkspacePayload> {
        const workspace = await this.workspaceRepository.findOne(workspaceId);
        if (!workspace) throw new NotFoundException('Workspace not found');
        return workspace;
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
