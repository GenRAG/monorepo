import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageSender } from 'generated/prisma';

@Injectable()
export class ConversationRepository {
    constructor(private readonly prisma: PrismaService) {}

    findAllByAgent(agentId: string) {
        return this.prisma.conversation.findMany({
            where: { agentId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.conversation.findUnique({ where: { id } });
    }

    findMessages(conversationId: string) {
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

    create(data: { agentId: string; workspaceId: string; title: string }) {
        return this.prisma.conversation.create({ data });
    }

    createMessage(data: {
        conversationId: string;
        sender: MessageSender;
        content: string;
    }) {
        return this.prisma.message.create({ data });
    }

    delete(id: string) {
        return this.prisma.conversation.delete({ where: { id } });
    }
}
