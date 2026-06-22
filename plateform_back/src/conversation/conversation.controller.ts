import { BadRequestException, Controller, Delete, Get, Param, Query, Sse, UseGuards } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserPipe } from 'src/users/pipes/user-validation.pipe';
import { UserSafe } from 'src/users/dto/create-user.request';
import { ConversationService } from './conversation.service';
import { AgentRuntimeService } from 'src/agent-runtime/agent-runtime.service';

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
    getAssistantMetadata(@Param('agentId') agentId: string) {
        return this.conversationService.getAssistantMetadata(agentId);
    }

    @Get(':agentId/conversations')
    getConversations(@Param('agentId') agentId: string, @CurrentUser(CurrentUserPipe) user: UserSafe) {
        return this.conversationService.getConversations(user.id, agentId);
    }

    @Sse(':agentId/stream')
    stream(
        @Param('agentId') agentId: string,
        @Query('query') query: string,
        @CurrentUser(CurrentUserPipe) user: UserSafe,
        @Query('conversationId') conversationId?: string,
    ): Observable<MessageEvent> {
        if (!query) throw new BadRequestException('Query parameter required');
        return this.agentRuntimeService.streamWithPersistence(agentId, query, conversationId, user.id);
    }

    @Get(':agentId/conversations/:conversationId/messages')
    getMessages(@Param('conversationId') conversationId: string, @CurrentUser(CurrentUserPipe) user: UserSafe) {
        return this.conversationService.getMessages(user.id, conversationId);
    }

    @Delete(':agentId/conversations/:conversationId')
    deleteConversation(@Param('conversationId') conversationId: string, @CurrentUser(CurrentUserPipe) user: UserSafe) {
        return this.conversationService.deleteConversation(user.id, conversationId);
    }
}
