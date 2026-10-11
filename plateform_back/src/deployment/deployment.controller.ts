import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UserSafe } from 'src/users/dto/create-user.request';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentRequest } from './dto/create-deployment.request';
import { RollbackDeploymentRequest } from './dto/rollback-deployment.request';

@Controller('workspaces/:workspaceId/agents/:agentId/deployments')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard, AgentBelongsToWorkspaceGuard)
export class DeploymentController {
    constructor(private readonly deploymentService: DeploymentService) {}

    @Get()
    getHistory(@Param('agentId') agentId: string) {
        return this.deploymentService.findAll(agentId);
    }

    @Get('current')
    getCurrent(@Param('agentId') agentId: string, @Param('workspaceId') workspaceId: string) {
        return this.deploymentService.getCurrent(agentId, workspaceId);
    }

    @Get(':id')
    getOne(@Param('id') id: string, @Param('agentId') agentId: string) {
        return this.deploymentService.findOne(id, agentId);
    }

    @Post()
    deploy(
        @Param('agentId') agentId: string,
        @Param('workspaceId') workspaceId: string,
        @Body() dto: CreateDeploymentRequest,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ) {
        return this.deploymentService.deploy(agentId, workspaceId, dto, user.id);
    }

    @Post('stop')
    stop(
        @Param('agentId') agentId: string,
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ) {
        return this.deploymentService.stop(agentId, workspaceId, user.id);
    }

    @Post('rollback')
    rollback(
        @Param('agentId') agentId: string,
        @Param('workspaceId') workspaceId: string,
        @Body() dto: RollbackDeploymentRequest,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ) {
        return this.deploymentService.rollback(agentId, workspaceId, dto, user.id);
    }
}
