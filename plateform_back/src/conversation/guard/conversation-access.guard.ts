import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from 'src/conversation/conversation.repository';

@Injectable()
export class ConversationAccessGuard implements CanActivate {
    constructor(private readonly conversationRepo: ConversationRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, params } = request;
        if (!user || !params?.conversationId) return false;

        const conversation = await this.conversationRepo.findOne(params.conversationId);
        if (!conversation || conversation.userId !== user.userId) {
            throw new NotFoundException('Conversation not found');
        }

        const hasAccess = await this.conversationRepo.hasAgentAccess(user.userId, conversation.agent.id);
        if (!hasAccess) throw new ForbiddenException('Access denied');

        return true;
    }
}
