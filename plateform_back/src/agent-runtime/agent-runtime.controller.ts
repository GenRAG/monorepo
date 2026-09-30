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
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AgentRuntimeService } from './agent-runtime.service';
import { AgentQueryLogRepository } from './agent-query-log.repository';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { MAX_RUNTIME_QUERY_LENGTH } from 'src/agent-runtime/agent-runtime.types';

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
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60_000 } })
    playground(
        @Param('workspaceId') workspaceId: string,
        @Param('agentId') agentId: string,
        @Query('query') query: string,
    ): Observable<MessageEvent> {
        if (!query) throw new BadRequestException('Query parameter required');
        if (query.length > MAX_RUNTIME_QUERY_LENGTH) {
            throw new BadRequestException(`Query must not exceed ${MAX_RUNTIME_QUERY_LENGTH} characters`);
        }

        return this.agentRuntimeService.playgroundStream(workspaceId, agentId, query);
    }
}
