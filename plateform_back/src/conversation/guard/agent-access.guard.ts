import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConversationRepository } from 'src/conversation/conversation.repository';

@Injectable()
export class AgentAccessGuard implements CanActivate {
    constructor(private readonly conversationRepo: ConversationRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, params } = request;
        if (!user || !params?.agentId) return false;

        const hasAccess = await this.conversationRepo.hasAgentAccess(user.userId, params.agentId);
        if (!hasAccess) throw new ForbiddenException('Access denied');

        return true;
    }
}
