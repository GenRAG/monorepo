import {
    BadRequestException,
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Dataset, UserRole } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { RolesInWorkspace } from 'src/workspace/roles/roles-workspace.decorator';
import { DatasetService } from './dataset.service';
import { DatasetBelongsToWorkspaceGuard } from './guard/dataset-workspace.guard';
import { CreateDatasetRequest } from './dto/create-dataset.request';
import { UpdateDatasetRequest } from './dto/update-dataset.request';
import { SetDatasetAgentsRequest } from './dto/set-dataset-agents.request';
import { DatasetAnalytics, DatasetListItem } from './dataset.types';
import { ANALYTICS_PERIOD_DAYS } from 'src/agent-analytics/dto/analytics-period.query';

@Controller('workspaces/:workspaceId/datasets')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard, DatasetBelongsToWorkspaceGuard)
export class DatasetController {
    constructor(private readonly datasetService: DatasetService) {}

    @Post()
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    create(@Param('workspaceId') workspaceId: string, @Body() dto: CreateDatasetRequest): Promise<Dataset> {
        return this.datasetService.create(workspaceId, dto);
    }

    @Get()
    findAll(@Param('workspaceId') workspaceId: string): Promise<DatasetListItem[]> {
        return this.datasetService.findAll(workspaceId);
    }

    @Get(':id')
    findOne(@Param('workspaceId') workspaceId: string, @Param('id') id: string): Promise<DatasetListItem> {
        return this.datasetService.findOne(id, workspaceId);
    }

    @Get(':id/analytics')
    @ApiOperation({ summary: 'Additions timeline, storage and breakdowns of a dataset' })
    getAnalytics(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    ): Promise<DatasetAnalytics> {
        if (!(ANALYTICS_PERIOD_DAYS as readonly number[]).includes(days)) {
            throw new BadRequestException(`days must be one of ${ANALYTICS_PERIOD_DAYS.join(', ')}`);
        }
        return this.datasetService.getAnalytics(id, workspaceId, days);
    }

    @Patch(':id')
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    update(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Body() dto: UpdateDatasetRequest,
    ): Promise<Dataset> {
        return this.datasetService.update(id, workspaceId, dto);
    }

    @Delete(':id')
    @RolesInWorkspace(UserRole.ADMIN)
    @HttpCode(204)
    async delete(@Param('workspaceId') workspaceId: string, @Param('id') id: string): Promise<void> {
        await this.datasetService.delete(id, workspaceId);
    }

    @Post(':id/agents/:agentId')
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    @HttpCode(204)
    @ApiOperation({ summary: 'Attach the dataset to an agent' })
    async attach(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Param('agentId') agentId: string,
    ): Promise<void> {
        await this.datasetService.attachToAgent(id, agentId, workspaceId);
    }

    @Delete(':id/agents/:agentId')
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    @HttpCode(204)
    @ApiOperation({ summary: 'Detach the dataset from an agent' })
    async detach(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Param('agentId') agentId: string,
    ): Promise<void> {
        await this.datasetService.detachFromAgent(id, agentId, workspaceId);
    }

    @Put(':id/agents')
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    @HttpCode(204)
    @ApiOperation({ summary: 'Replace the set of agents using the dataset' })
    async setAgents(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
        @Body() dto: SetDatasetAgentsRequest,
    ): Promise<void> {
        await this.datasetService.setAgents(id, dto.agentIds, workspaceId);
    }
}
