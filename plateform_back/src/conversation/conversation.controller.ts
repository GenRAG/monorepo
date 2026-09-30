import { BadRequestException, Controller, Delete, Get, Param, Query, Sse, UseGuards } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UserSafe } from 'src/users/dto/create-user.request';
import { ConversationService } from './conversation.service';
import { AgentRuntimeService } from 'src/agent-runtime/agent-runtime.service';
import { MAX_RUNTIME_QUERY_LENGTH } from 'src/agent-runtime/agent-runtime.types';
import { AgentAccessGuard } from 'src/conversation/guard/agent-access.guard';
import { ConversationAccessGuard } from 'src/conversation/guard/conversation-access.guard';

@Controller('assistants')
@UseGuards(JwtAuthGuard)
export class ConversationController {
    constructor(
        private readonly conversationService: ConversationService,
        private readonly agentRuntimeService: AgentRuntimeService,
    ) {}

    @Get()
    getAssistants(@CurrentUser(CurrentUserPipe) user: UserSafe) {
        return this.conversationService.getAssistants(user.id);
    }

    @Get(':agentId')
    @UseGuards(AgentAccessGuard)
    getAssistantMetadata(@Param('agentId') agentId: string) {
        return this.conversationService.getAssistantMetadata(agentId);
    }

    @Get(':agentId/conversations')
    @UseGuards(AgentAccessGuard)
    getConversations(@Param('agentId') agentId: string, @CurrentUser(CurrentUserPipe) user: UserSafe) {
        return this.conversationService.getConversations(user.id, agentId);
    }

    @Sse(':agentId/stream')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60_000 } })
    stream(
        @Param('agentId') agentId: string,
        @Query('query') query: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Query('conversationId') conversationId?: string,
    ): Observable<MessageEvent> {
        if (!query) throw new BadRequestException('Query parameter required');
        if (query.length > MAX_RUNTIME_QUERY_LENGTH) {
            throw new BadRequestException(`Query must not exceed ${MAX_RUNTIME_QUERY_LENGTH} characters`);
        }
        return this.agentRuntimeService.streamWithPersistence(agentId, query, conversationId, user.id);
    }

    @Get(':agentId/conversations/:conversationId/messages')
    @UseGuards(ConversationAccessGuard)
    getMessages(@Param('conversationId') conversationId: string) {
        return this.conversationService.getMessages(conversationId);
    }

    @Get(':agentId/sources/url')
    @UseGuards(AgentAccessGuard)
    getSourceUrl(@Param('agentId') agentId: string, @Query('title') title: string) {
        if (!title) throw new BadRequestException('Title query parameter required');
        return this.conversationService.getSourceUrl(agentId, title);
    }

    @Delete(':agentId/conversations/:conversationId')
    @UseGuards(ConversationAccessGuard)
    deleteConversation(@Param('conversationId') conversationId: string) {
        return this.conversationService.deleteConversation(conversationId);
    }
}
