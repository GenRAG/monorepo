import {
    BadRequestException,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards,
    Sse,
    Query,
    DefaultValuePipe,
} from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AgentRuntimeService } from './agent-runtime.service';
import { AgentQueryLogRepository } from './agent-query-log.repository';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';

@Controller('workspaces/:workspaceId/agents/:agentId/runtime')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard, AgentBelongsToWorkspaceGuard)
export class AgentRuntimeController {
    constructor(
        private readonly agentRuntimeService: AgentRuntimeService,
        private readonly queryLogRepository: AgentQueryLogRepository,
    ) {}

    @Get('query-logs')
    getQueryLogs(
        @Param('agentId') agentId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        return this.queryLogRepository.findByAgent(agentId, page, Math.min(limit, 100));
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
