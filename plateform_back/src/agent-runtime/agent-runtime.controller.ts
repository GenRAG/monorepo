import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AgentRuntimeService } from './agent-runtime.service';
import { ExecuteAgentRuntimeRequest } from 'src/agent-runtime/dto/create-agent-runtime.request';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';

@Controller('workspaces/:workspaceId/agents/:agentId/runtime')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class AgentRuntimeController {
    constructor(private readonly agentRuntimeService: AgentRuntimeService) {}

    @Post()
    create(
        @Param('workspaceId') workspaceId: string,
        @Param('agentId') agentId: string,
        @Body() createAgentRuntimeDto: ExecuteAgentRuntimeRequest,
    ) {
        return this.agentRuntimeService.execute(
            createAgentRuntimeDto,
            agentId,
            workspaceId,
        );
    }
}
