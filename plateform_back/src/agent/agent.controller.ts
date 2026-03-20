import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentRequest } from './dto/create-agent.request';
import { UpdateAgentRequest } from './dto/update-agent.request';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/roles/guards/workspace-roles.guard';
import { RolesInWorkspace } from 'src/roles/roles-workspace.decorateur';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UserSafe } from 'src/users/dto/create-user.request';
import { Agent, UserRole } from 'generated/prisma';

@Controller('workspaces/:workspaceId/agents')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class AgentController {
    constructor(private readonly agentService: AgentService) {}

    @Post()
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    create(
        @Param('workspaceId') workspaceId: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Body() createAgentRequest: CreateAgentRequest,
    ): Promise<Agent> {
        return this.agentService.insertOne(
            createAgentRequest,
            user.id,
            workspaceId,
        );
    }

    @Get()
    getAll(@Param('workspaceId') workspaceId: string): Promise<Agent[]> {
        return this.agentService.findAll(workspaceId);
    }

    @Get(':id')
    getOne(
        @Param('workspaceId') workspaceId: string,
        @Param('id') id: string,
    ): Promise<Agent> {
        return this.agentService.findOne(id, workspaceId);
    }

    @Patch(':id')
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    update(
        @Param('id') id: string,
        @Param('workspaceId') workspaceId: string,
        @Body() updateAgentRequest: UpdateAgentRequest,
    ): Promise<Agent> {
        return this.agentService.update(id, workspaceId, updateAgentRequest);
    }

    @Delete(':id')
    @RolesInWorkspace(UserRole.ADMIN)
    remove(
        @Param('id') id: string,
        @Param('workspaceId') workspaceId: string,
    ): Promise<Agent> {
        return this.agentService.remove(id, workspaceId);
    }
}
