import { Injectable } from '@nestjs/common';
import { AgentStatus, MessageSender, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

type PrismaClientOrTx = PrismaService | Prisma.TransactionClient;

@Injectable()
export class ConversationRepository {
    constructor(private readonly prisma: PrismaService) {}

    transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(fn);
    }

    findAssistants(userId: string) {
        return this.prisma.agent.findMany({
            where: {
                status: AgentStatus.PRODUCTION,
                OR: [{ workspace: { users: { some: { userId } } } }, { members: { some: { userId } } }],
            },
            include: { workspace: { select: { name: true } } },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async hasAgentAccess(userId: string, agentId: string): Promise<boolean> {
        const agent = await this.prisma.agent.findUnique({
            where: { id: agentId },
            select: {
                workspace: { select: { users: { where: { userId }, select: { userId: true } } } },
                members: { where: { userId }, select: { userId: true } },
            },
        });
        if (!agent) return false;
        return agent.workspace.users.length > 0 || agent.members.length > 0;
    }

    findAllByAgent(agentId: string, userId: string) {
        return this.prisma.conversation.findMany({
            where: { agentId, userId },
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
        return this.prisma.conversation.findUnique({
            where: { id },
            include: { agent: { select: { id: true, name: true, workspaceId: true } } },
        });
    }

    findAgent(id: string) {
        return this.prisma.agent.findUnique({
            where: { id },
            include: {
                workspace: { select: { name: true } },
                deployments: { orderBy: { version: 'desc' }, take: 1, select: { version: true } },
            },
        });
    }

    findMessages(conversationId: string) {
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

    create(
        data: { agentId: string; workspaceId: string; title: string; userId?: string },
        client: PrismaClientOrTx = this.prisma,
    ) {
        return client.conversation.create({ data });
    }

    createMessage(
        data: {
            conversationId: string;
            sender: MessageSender;
            content: string;
            metadata?: Prisma.InputJsonValue;
        },
        client: PrismaClientOrTx = this.prisma,
    ) {
        return client.message.create({ data });
    }

    findDocumentByAgentAndName(agentId: string, name: string) {
        return this.prisma.document.findFirst({ where: { agentId, name } });
    }

    updateTimestamp(id: string) {
        return this.prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
    }

    delete(id: string) {
        return this.prisma.conversation.delete({ where: { id } });
    }
}
