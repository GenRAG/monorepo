import { Controller, Param, UseGuards, Sse, Query } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AgentRuntimeService } from './agent-runtime.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';

@Controller('workspaces/:workspaceId/agents/:agentId/runtime')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class AgentRuntimeController {
    constructor(private readonly agentRuntimeService: AgentRuntimeService) {}

    @Sse('stream')
    stream(
        @Param('workspaceId') workspaceId: string,
        @Param('agentId') agentId: string,
        @Query('query') query: string,
    ): Observable<MessageEvent> {
        if (!query) {
            return new Observable((s) => {
                s.next({
                    data: JSON.stringify({ error: 'Query parameter required' }),
                });
                s.complete();
            });
        }
        return this.agentRuntimeService.stream(workspaceId, agentId, query);
    }
}
