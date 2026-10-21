import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    DefaultValuePipe,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { Workspace } from 'generated/prisma';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';
import { UserSafe } from 'src/users/dto/create-user.request';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { CreateWorkspaceRequest } from 'src/workspace/dto/create-workspace.request';
import { UpdateWorkspaceRequest } from 'src/workspace/dto/update-workspace.request';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { WorkspaceWithUsers, WorkspacePayload } from 'src/workspace/workspace.repository';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @Post()
    createWorkspace(
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() createWorkspaceRequest: CreateWorkspaceRequest,
    ): Promise<WorkspaceWithUsers> {
        return this.workspaceService.create(createWorkspaceRequest, user);
    }

    @Get()
    getAllWorkspaces(@CurrentUser(CurrentUserPipe) user: UserSafe): Promise<WorkspaceWithUsers[]> {
        return this.workspaceService.findAll(user.id);
    }

    @Get(':id')
    @UseGuards(WorkspaceMemberGuard)
    getWorkspaceById(@Param('id') workspaceId: string): Promise<WorkspacePayload> {
        return this.workspaceService.findOne(workspaceId);
    }

    @Get(':id/stats')
    @UseGuards(WorkspaceMemberGuard)
    getWorkspaceStats(@Param('id') workspaceId: string) {
        return this.workspaceService.getStats(workspaceId);
    }

    @Get(':id/consumption')
    @UseGuards(WorkspaceMemberGuard)
    getWorkspaceConsumption(
        @Param('id') workspaceId: string,
        @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    ) {
        return this.workspaceService.getConsumption(workspaceId, Math.min(Math.max(days, 7), 90));
    }

    @Patch(':id')
    @UseGuards(WorkspaceMemberGuard)
    renameWorkspace(@Param('id') workspaceId: string, @Body() dto: UpdateWorkspaceRequest): Promise<Workspace> {
        return this.workspaceService.rename(workspaceId, dto);
    }
}
