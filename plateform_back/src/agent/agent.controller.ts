import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentRequest } from './dto/create-agent.request';
import { UpdateAgentRequest } from './dto/update-agent.request';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { RolesInWorkspace } from 'src/workspace/roles/roles-workspace.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UserSafe } from 'src/users/dto/create-user.request';
import { Agent, UserRole } from 'generated/prisma';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { FindAllAgentResult } from 'src/agent/agent.repository';

@Controller('workspaces/:workspaceId/agents')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard, AgentBelongsToWorkspaceGuard)
export class AgentController {
    constructor(private readonly agentService: AgentService) {}

    @Post()
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    create(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() createAgentRequest: CreateAgentRequest,
    ): Promise<Agent> {
        return this.agentService.insertOne(createAgentRequest, user.id, workspaceId);
    }

    @Get()
    getAll(@Param('workspaceId') workspaceId: string): Promise<FindAllAgentResult[]> {
        return this.agentService.findAll(workspaceId);
    }

    @Get(':id')
    getOne(@Param('workspaceId') workspaceId: string, @Param('id') id: string): Promise<Agent> {
        return this.agentService.findOne(id, workspaceId);
    }

    @Patch(':id')
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    update(
        @Param('id') id: string,
        @Body() updateAgentRequest: UpdateAgentRequest,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ): Promise<Agent> {
        return this.agentService.update(id, updateAgentRequest, user.id);
    }

    @Delete(':id')
    @RolesInWorkspace(UserRole.ADMIN)
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.agentService.remove(id);
    }
}
