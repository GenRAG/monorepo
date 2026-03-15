import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole, Workspace } from 'generated/prisma';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/roles/guards/workspace-roles.guard';
import { RolesInWorkspace } from 'src/roles/roles-workspace.decorateur';
import { UserSafe } from 'src/users/dto/create-user.request';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { CreateWorkspaceRequest } from 'src/workspace/dto/create-workspace.request';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Controller('workspace')
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @Post('create')
    @UseGuards(JwtAuthGuard)
    createWorkspace(
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() createWorkspaceRequest: CreateWorkspaceRequest,
    ): Promise<Workspace> {
        return this.workspaceService.createWorkspace(
            createWorkspaceRequest,
            user.id,
        );
    }

    /*@Get('all')
    @UseGuards(JwtAuthGuard)
    getAllWorkspaces(@CurrentUser(CurrentUserPipe) user: UserSafe): Promise<
        {
            id: string;
            name: string;
            projects: { id: string; name: string }[];
        }[]
    > {
        return this.workspaceService.getAllWorkspacesForUser(user.id);
    }*/

    @Get(':id')
    @UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
    getWorkspaceById(
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Param('id') workspaceId: string,
    ): Promise<Workspace> {
        return this.workspaceService.getWorkspaceById(workspaceId, user.id);
    }
}
