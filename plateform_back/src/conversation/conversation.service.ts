import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MessageSender } from 'generated/prisma';
import { ConversationRepository } from './conversation.repository';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { RagSources } from 'src/rag-engine/ndjson-line-buffer';
import { sanitizeFilename } from 'src/lib/filename.util';

export interface MessageSerialized {
    id: string;
    question: string;
    response: string;
    timestamp: number;
    sources?: RagSources[];
    durationMs?: number;
}

@Injectable()
export class ConversationService {
    constructor(
        private readonly repo: ConversationRepository,
        @Inject('STORAGE_STRATEGY') private readonly storage: IStorageStrategy,
    ) {}

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
            version: agent.deployments[0]?.version,
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

            const metadata = agentMsg?.metadata as { sources?: RagSources[]; durationMs?: number } | null;

            result.push({
                id: msg.id,
                question: msg.content,
                response: agentMsg?.content ?? '',
                timestamp: msg.createdAt.getTime(),
                sources: metadata?.sources,
                durationMs: metadata?.durationMs,
            });
        }

        return result;
    }

    async getSourceUrl(userId: string, agentId: string, title: string): Promise<{ url: string }> {
        const hasAccess = await this.repo.hasAgentAccess(userId, agentId);
        if (!hasAccess) throw new ForbiddenException('Access denied');

        const document = await this.repo.findDocumentByAgentAndName(agentId, sanitizeFilename(title));
        if (!document) throw new NotFoundException('Document not found');

        const url = await this.storage.getSignedUrl(document.storageKey, 900);
        return { url };
    }

    async deleteConversation(userId: string, conversationId: string) {
        const conversation = await this.repo.findOne(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        const hasAccess = await this.repo.hasAgentAccess(userId, conversation.agent.id);
        if (!hasAccess) throw new ForbiddenException('Access denied');

        return this.repo.delete(conversationId);
    }
}
