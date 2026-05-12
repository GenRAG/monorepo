import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageSender } from 'generated/prisma';
import { ConversationRepository } from './conversation.repository';
import { PrismaService } from 'src/prisma/prisma.service';

export interface messageSerialized {
    id: string;
    question: string;
    response: string[];
    timestamp: number;
}

@Injectable()
export class ConversationService {
    constructor(
        private readonly repo: ConversationRepository,
        private readonly prisma: PrismaService,
    ) {}

    async getAssistants(userId: string) {
        const agents = await this.prisma.agent.findMany({
            where: {
                workspace: { users: { some: { userId } } },
                status: 'PRODUCTION',
            },
            include: { workspace: { select: { name: true } } },
            orderBy: { updatedAt: 'desc' },
        });

        return agents.map((a) => ({
            id: a.id,
            title: a.name,
            sharedBy: a.workspace.name,
            updatedAt: a.updatedAt.toISOString(),
        }));
    }

    async getAssistantMetadata(agentId: string) {
        const agent = await this.prisma.agent.findUnique({
            where: { id: agentId },
            include: { workspace: { select: { name: true } } },
        });
        if (!agent) throw new NotFoundException('Assistant not found');
        return {
            id: agent.id,
            title: agent.name,
            sharedBy: agent.workspace.name,
        };
    }

    async getConversations(agentId: string) {
        const conversations = await this.repo.findAllByAgent(agentId);
        return conversations.map((c) => ({
            id: c.id,
            title: c.title,
            lastMessage: c.messages[0]?.content ?? null,
            updatedAt: c.updatedAt.toISOString(),
        }));
    }

    async getMessages(conversationId: string): Promise<messageSerialized[]> {
        const messages = await this.repo.findMessages(conversationId);
        const result: messageSerialized[] = [];

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (msg.sender !== MessageSender.USER) continue;

            let agentMsg: (typeof messages)[0] | null = null;
            for (let j = i + 1; j < messages.length; j++) {
                if (messages[j].sender === MessageSender.AGENT) {
                    agentMsg = messages[j];
                    i = j;
                    break;
                }
                if (messages[j].sender === MessageSender.USER) break;
            }

            result.push({
                id: msg.id,
                question: msg.content,
                response: agentMsg ? [agentMsg.content] : [],
                timestamp: msg.createdAt.getTime(),
            });
        }

        return result;
    }

    async deleteConversation(conversationId: string) {
        const conversation = await this.repo.findOne(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');
        return this.repo.delete(conversationId);
    }
}
