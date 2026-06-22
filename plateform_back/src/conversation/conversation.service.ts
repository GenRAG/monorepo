import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageSender } from 'generated/prisma';
import { ConversationRepository } from './conversation.repository';

export interface MessageSerialized {
    id: string;
    question: string;
    response: string;
    timestamp: number;
}

@Injectable()
export class ConversationService {
    constructor(private readonly repo: ConversationRepository) {}

    async getAssistants(userId: string) {
        const agents = await this.repo.findAssistants(userId);

        return agents.map((a) => ({
            id: a.id,
            title: a.name,
            sharedBy: a.workspace.name,
            updatedAt: a.updatedAt.toISOString(),
        }));
    }

    async getAssistantMetadata(agentId: string) {
        const agent = await this.repo.findAgent(agentId);

        if (!agent) throw new NotFoundException('Assistant not found');

        return {
            id: agent.id,
            title: agent.name,
            sharedBy: agent.workspace.name,
        };
    }

    async getConversations(userId: string, agentId: string) {
        const hasAccess = await this.repo.hasAgentAccess(userId, agentId);
        if (!hasAccess) throw new ForbiddenException('Access denied');

        const conversations = await this.repo.findAllByAgent(agentId, userId);

        return conversations.map((c) => ({
            id: c.id,
            title: c.title,
            lastMessage: c.messages[0]?.content ?? null,
            updatedAt: c.updatedAt.toISOString(),
        }));
    }

    async getMessages(userId: string, conversationId: string): Promise<MessageSerialized[]> {
        const conversation = await this.repo.findOne(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        const hasAccess = await this.repo.hasAgentAccess(userId, conversation.agent.id);
        if (!hasAccess) throw new ForbiddenException('Access denied');

        const messages = await this.repo.findMessages(conversationId);
        const result: MessageSerialized[] = [];

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (msg.sender !== MessageSender.USER) continue;

            const next = messages[i + 1];
            const agentMsg = next?.sender === MessageSender.AGENT ? next : null;
            if (agentMsg) i++;

            result.push({
                id: msg.id,
                question: msg.content,
                response: agentMsg?.content ?? "",
                timestamp: msg.createdAt.getTime(),
            });
        }

        return result;
    }

    async deleteConversation(userId: string, conversationId: string) {
        const conversation = await this.repo.findOne(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        const hasAccess = await this.repo.hasAgentAccess(userId, conversation.agent.id);
        if (!hasAccess) throw new ForbiddenException('Access denied');

        return this.repo.delete(conversationId);
    }
}
