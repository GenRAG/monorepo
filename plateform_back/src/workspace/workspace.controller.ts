import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { UserRole, Workspace } from 'generated/prisma';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { RolesInWorkspace } from 'src/workspace/roles/roles-workspace.decorateur';
import { UserSafe } from 'src/users/dto/create-user.request';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { CreateWorkspaceRequest } from 'src/workspace/dto/create-workspace.request';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';

@Controller('workspaces')
@UseGuards(JwtAuthGuard, AgentBelongsToWorkspaceGuard)
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @Post()
    createWorkspace(
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() createWorkspaceRequest: CreateWorkspaceRequest,
    ): Promise<Workspace> {
        return this.workspaceService.create(createWorkspaceRequest, user.id);
    }

    @Get()
    getAllWorkspaces(
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ): Promise<Workspace[]> {
        return this.workspaceService.findAll(user.id);
    }

    @Get(':id')
    @UseGuards(WorkspaceRolesGuard)
    getWorkspaceById(@Param('id') workspaceId: string): Promise<Workspace> {
        return this.workspaceService.findOne(workspaceId);
    }

    @Delete(':id')
    @UseGuards(WorkspaceRolesGuard)
    @RolesInWorkspace(UserRole.ADMIN)
    @HttpCode(204)
    deleteWorkspace(@Param('id') workspaceId: string): Promise<void> {
        return this.workspaceService.delete(workspaceId);
    }
}
