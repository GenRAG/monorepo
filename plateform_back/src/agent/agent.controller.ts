import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentRequest } from './dto/create-agent.request';
import { UpdateAgentRequest } from './dto/update-agent.request';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UserSafe } from 'src/users/dto/create-user.request';
import { Agent } from 'generated/prisma';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { AgentListItem } from 'src/agent/agent.repository';

@Controller('workspaces/:workspaceId/agents')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard, AgentBelongsToWorkspaceGuard)
export class AgentController {
    constructor(private readonly agentService: AgentService) {}

    @Post()
    create(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() createAgentRequest: CreateAgentRequest,
    ): Promise<Agent> {
        return this.agentService.insertOne(createAgentRequest, user.id, workspaceId);
    }

    @Get()
    getAll(@Param('workspaceId') workspaceId: string): Promise<AgentListItem[]> {
        return this.agentService.findAll(workspaceId);
    }

    @Get(':id')
    getOne(@Param('workspaceId') workspaceId: string, @Param('id') id: string): Promise<Agent> {
        return this.agentService.findOne(id, workspaceId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateAgentRequest: UpdateAgentRequest,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
    ): Promise<Agent> {
        return this.agentService.update(id, updateAgentRequest, user.id);
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.agentService.remove(id);
    }
}
