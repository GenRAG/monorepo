import { Test, TestingModule } from '@nestjs/testing';
import { ConversationRepository } from '../conversation.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgentStatus, MessageSender } from 'generated/prisma';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockPrismaService: any = {
    agent: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    conversation: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    message: {
        findMany: jest.fn(),
        create: jest.fn(),
    },
};

describe('ConversationRepository', () => {
    let repository: ConversationRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConversationRepository, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        repository = module.get<ConversationRepository>(ConversationRepository);
        jest.clearAllMocks();
    });

    describe('findAssistants', () => {
        it('should find PRODUCTION agents with user access', async () => {
            const agents = [{ id: 'agent-1', name: 'Bot 1', workspace: { name: 'WS A' }, updatedAt: new Date() }];
            mockPrismaService.agent.findMany.mockResolvedValue(agents);

            const result = await repository.findAssistants('user-1');

            expect(mockPrismaService.agent.findMany).toHaveBeenCalledWith({
                where: {
                    status: AgentStatus.PRODUCTION,
                    OR: [
                        { workspace: { users: { some: { userId: 'user-1' } } } },
                        { members: { some: { userId: 'user-1' } } },
                    ],
                },
                include: { workspace: { select: { name: true } } },
                orderBy: { updatedAt: 'desc' },
            });
            expect(result).toEqual(agents);
        });

        it('should return empty array when no assistants found', async () => {
            mockPrismaService.agent.findMany.mockResolvedValue([]);

            const result = await repository.findAssistants('user-1');

            expect(result).toEqual([]);
        });
    });

    describe('hasAgentAccess', () => {
        it('should return true when user is workspace member', async () => {
            mockPrismaService.agent.findUnique.mockResolvedValue({
                workspace: { users: [{ userId: 'user-1' }] },
                members: [],
            });

            const result = await repository.hasAgentAccess('user-1', 'agent-1');

            expect(result).toBe(true);
        });

        it('should return true when user is agent member', async () => {
            mockPrismaService.agent.findUnique.mockResolvedValue({
                workspace: { users: [] },
                members: [{ userId: 'user-1' }],
            });

            const result = await repository.hasAgentAccess('user-1', 'agent-1');

            expect(result).toBe(true);
        });

        it('should return false when user has no access', async () => {
            mockPrismaService.agent.findUnique.mockResolvedValue({
                workspace: { users: [] },
                members: [],
            });

            const result = await repository.hasAgentAccess('user-1', 'agent-1');

            expect(result).toBe(false);
        });

        it('should return false when agent not found', async () => {
            mockPrismaService.agent.findUnique.mockResolvedValue(null);

            const result = await repository.hasAgentAccess('user-1', 'agent-1');

            expect(result).toBe(false);
        });
    });

    describe('findAllByAgent', () => {
        it('should find conversations for agent and user', async () => {
            const conversations = [
                {
                    id: 'conv-1',
                    agentId: 'agent-1',
                    userId: 'user-1',
                    messages: [{ content: 'Latest' }],
                },
            ];
            mockPrismaService.conversation.findMany.mockResolvedValue(conversations);

            const result = await repository.findAllByAgent('agent-1', 'user-1');

            expect(mockPrismaService.conversation.findMany).toHaveBeenCalledWith({
                where: { agentId: 'agent-1', userId: 'user-1' },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { updatedAt: 'desc' },
            });
            expect(result).toEqual(conversations);
        });

        it('should return empty array when no conversations found', async () => {
            mockPrismaService.conversation.findMany.mockResolvedValue([]);

            const result = await repository.findAllByAgent('agent-1', 'user-1');

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should find conversation with agent details', async () => {
            const conversation = {
                id: 'conv-1',
                agent: { id: 'agent-1', name: 'Bot', workspaceId: 'ws-1' },
            };
            mockPrismaService.conversation.findUnique.mockResolvedValue(conversation);

            const result = await repository.findOne('conv-1');

            expect(mockPrismaService.conversation.findUnique).toHaveBeenCalledWith({
                where: { id: 'conv-1' },
                include: { agent: { select: { id: true, name: true, workspaceId: true } } },
            });
            expect(result).toEqual(conversation);
        });

        it('should return null when conversation not found', async () => {
            mockPrismaService.conversation.findUnique.mockResolvedValue(null);

            const result = await repository.findOne('missing-conv');

            expect(result).toBeNull();
        });
    });

    describe('findAgent', () => {
        it('should find agent with workspace', async () => {
            const agent = {
                id: 'agent-1',
                workspace: { name: 'Workspace A' },
            };
            mockPrismaService.agent.findUnique.mockResolvedValue(agent);

            const result = await repository.findAgent('agent-1');

            expect(mockPrismaService.agent.findUnique).toHaveBeenCalledWith({
                where: { id: 'agent-1' },
                include: { workspace: { select: { name: true } } },
            });
            expect(result).toEqual(agent);
        });
    });

    describe('findMessages', () => {
        it('should find messages ordered by creation date', async () => {
            const messages = [
                { id: 'msg-1', sender: MessageSender.USER, content: 'Hi', createdAt: new Date() },
                { id: 'msg-2', sender: MessageSender.AGENT, content: 'Hello', createdAt: new Date() },
            ];
            mockPrismaService.message.findMany.mockResolvedValue(messages);

            const result = await repository.findMessages('conv-1');

            expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
                where: { conversationId: 'conv-1' },
                orderBy: { createdAt: 'asc' },
            });
            expect(result).toEqual(messages);
        });
    });

    describe('create', () => {
        it('should create conversation with all fields', async () => {
            const data = {
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                title: 'New conversation',
                userId: 'user-1',
            };
            const created = { id: 'conv-1', ...data };
            mockPrismaService.conversation.create.mockResolvedValue(created);

            const result = await repository.create(data);

            expect(mockPrismaService.conversation.create).toHaveBeenCalledWith({ data });
            expect(result).toEqual(created);
        });

        it('should create conversation without userId', async () => {
            const data = {
                agentId: 'agent-1',
                workspaceId: 'ws-1',
                title: 'New conversation',
            };
            const created = { id: 'conv-1', ...data, userId: null };
            mockPrismaService.conversation.create.mockResolvedValue(created);

            const result = await repository.create(data);

            expect(mockPrismaService.conversation.create).toHaveBeenCalledWith({ data });
            expect(result.userId).toBeNull();
        });
    });

    describe('createMessage', () => {
        it('should create message with sender and content', async () => {
            const data = {
                conversationId: 'conv-1',
                sender: MessageSender.USER,
                content: 'Hello?',
            };
            const created = { id: 'msg-1', ...data, createdAt: new Date() };
            mockPrismaService.message.create.mockResolvedValue(created);

            const result = await repository.createMessage(data);

            expect(mockPrismaService.message.create).toHaveBeenCalledWith({ data });
            expect(result).toEqual(created);
        });
    });

    describe('delete', () => {
        it('should delete conversation by id', async () => {
            mockPrismaService.conversation.delete.mockResolvedValue({ id: 'conv-1' });

            await repository.delete('conv-1');

            expect(mockPrismaService.conversation.delete).toHaveBeenCalledWith({ where: { id: 'conv-1' } });
        });
    });
});
