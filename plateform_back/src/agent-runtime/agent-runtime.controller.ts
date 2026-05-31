import { BadRequestException, Controller, Param, UseGuards, Sse, Query } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AgentRuntimeService } from './agent-runtime.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';

@Controller('workspaces/:workspaceId/agents/:agentId/runtime')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard, AgentBelongsToWorkspaceGuard)
export class AgentRuntimeController {
    constructor(private readonly agentRuntimeService: AgentRuntimeService) {}

    @Sse('stream')
    stream(
        @Param('workspaceId') workspaceId: string,
        @Param('agentId') agentId: string,
        @Query('query') query: string,
    ): Observable<MessageEvent> {
        if (!query) throw new BadRequestException('Query parameter required');
        return this.agentRuntimeService.streamQuery(workspaceId, agentId, query);
    }

    @Sse('playground')
    playground(
        @Param('workspaceId') workspaceId: string,
        @Param('agentId') agentId: string,
        @Query('query') query: string,
    ): Observable<MessageEvent> {
        if (!query) throw new BadRequestException('Query parameter required');
        return this.agentRuntimeService.playgroundStream(workspaceId, agentId, query);
    }
}
