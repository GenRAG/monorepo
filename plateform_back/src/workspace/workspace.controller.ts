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
import { UserRole, Workspace } from 'generated/prisma';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { RolesInWorkspace } from 'src/workspace/roles/roles-workspace.decorator';
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
        return this.workspaceService.create(createWorkspaceRequest, user.id);
    }

    @Get()
    getAllWorkspaces(@CurrentUser(CurrentUserPipe) user: UserSafe): Promise<WorkspaceWithUsers[]> {
        return this.workspaceService.findAll(user.id);
    }

    @Get(':id')
    @UseGuards(WorkspaceRolesGuard)
    getWorkspaceById(@Param('id') workspaceId: string): Promise<WorkspacePayload> {
        return this.workspaceService.findOne(workspaceId);
    }

    @Get(':id/stats')
    @UseGuards(WorkspaceRolesGuard)
    getWorkspaceStats(@Param('id') workspaceId: string) {
        return this.workspaceService.getStats(workspaceId);
    }

    @Get(':id/consumption')
    @UseGuards(WorkspaceRolesGuard)
    getWorkspaceConsumption(
        @Param('id') workspaceId: string,
        @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    ) {
        return this.workspaceService.getConsumption(workspaceId, Math.min(Math.max(days, 7), 90));
    }

    @Patch(':id')
    @UseGuards(WorkspaceRolesGuard)
    @RolesInWorkspace(UserRole.ADMIN)
    renameWorkspace(@Param('id') workspaceId: string, @Body() dto: UpdateWorkspaceRequest): Promise<Workspace> {
        return this.workspaceService.rename(workspaceId, dto);
    }
}
