import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from '../conversation.service';
import { ConversationRepository } from '../conversation.repository';
import { MessageSender } from 'generated/prisma';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockConversationRepository: any = {
    findAssistants: jest.fn(),
    findAgent: jest.fn(),
    hasAgentAccess: jest.fn(),
    findAllByAgent: jest.fn(),
    findOne: jest.fn(),
    findMessages: jest.fn(),
    delete: jest.fn(),
};

describe('ConversationService', () => {
    let service: ConversationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConversationService, { provide: ConversationRepository, useValue: mockConversationRepository }],
        }).compile();

        service = module.get<ConversationService>(ConversationService);
        jest.clearAllMocks();
    });

    describe('getAssistants', () => {
        it('should map agents from repository', async () => {
            const agents = [
                { id: 'agent-1', name: 'Support Bot', workspace: { name: 'Workspace A' }, updatedAt: new Date() },
                { id: 'agent-2', name: 'Chat Bot', workspace: { name: 'Workspace B' }, updatedAt: new Date() },
            ];
            mockConversationRepository.findAssistants.mockResolvedValue(agents);

            const result = await service.getAssistants('user-1');

            expect(mockConversationRepository.findAssistants).toHaveBeenCalledWith('user-1');
            expect(result).toEqual([
                {
                    id: 'agent-1',
                    title: 'Support Bot',
                    sharedBy: 'Workspace A',
                    updatedAt: agents[0].updatedAt.toISOString(),
                },
                {
                    id: 'agent-2',
                    title: 'Chat Bot',
                    sharedBy: 'Workspace B',
                    updatedAt: agents[1].updatedAt.toISOString(),
                },
            ]);
        });

        it('should return empty array when no assistants found', async () => {
            mockConversationRepository.findAssistants.mockResolvedValue([]);

            const result = await service.getAssistants('user-1');

            expect(result).toEqual([]);
        });
    });

    describe('getAssistantMetadata', () => {
        it('should return agent metadata', async () => {
            const agent = {
                id: 'agent-1',
                name: 'Support Bot',
                workspace: { name: 'Workspace A' },
            };
            mockConversationRepository.findAgent.mockResolvedValue(agent);

            const result = await service.getAssistantMetadata('agent-1');

            expect(result).toEqual({
                id: 'agent-1',
                title: 'Support Bot',
                sharedBy: 'Workspace A',
            });
        });

        it('should throw NotFoundException when agent not found', async () => {
            mockConversationRepository.findAgent.mockResolvedValue(null);

            await expect(service.getAssistantMetadata('missing-agent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getConversations', () => {
        it('should throw ForbiddenException when user has no access', async () => {
            mockConversationRepository.hasAgentAccess.mockResolvedValue(false);

            await expect(service.getConversations('user-1', 'agent-1')).rejects.toThrow(ForbiddenException);
            expect(mockConversationRepository.findAllByAgent).not.toHaveBeenCalled();
        });

        it('should return mapped conversations when user has access', async () => {
            mockConversationRepository.hasAgentAccess.mockResolvedValue(true);
            const conversations = [
                {
                    id: 'conv-1',
                    title: 'First Conversation',
                    updatedAt: new Date(),
                    messages: [{ content: 'Latest message' }],
                },
                {
                    id: 'conv-2',
                    title: 'Second Conversation',
                    updatedAt: new Date(),
                    messages: [],
                },
            ];
            mockConversationRepository.findAllByAgent.mockResolvedValue(conversations);

            const result = await service.getConversations('user-1', 'agent-1');

            expect(mockConversationRepository.findAllByAgent).toHaveBeenCalledWith('agent-1', 'user-1');
            expect(result).toEqual([
                {
                    id: 'conv-1',
                    title: 'First Conversation',
                    lastMessage: 'Latest message',
                    updatedAt: conversations[0].updatedAt.toISOString(),
                },
                {
                    id: 'conv-2',
                    title: 'Second Conversation',
                    lastMessage: null,
                    updatedAt: conversations[1].updatedAt.toISOString(),
                },
            ]);
        });
    });

    describe('getMessages', () => {
        it('should throw NotFoundException when conversation not found', async () => {
            mockConversationRepository.findOne.mockResolvedValue(null);

            await expect(service.getMessages('user-1', 'conv-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user has no access to agent', async () => {
            const conversation = {
                id: 'conv-1',
                agent: { id: 'agent-1' },
            };
            mockConversationRepository.findOne.mockResolvedValue(conversation);
            mockConversationRepository.hasAgentAccess.mockResolvedValue(false);

            await expect(service.getMessages('user-1', 'conv-1')).rejects.toThrow(ForbiddenException);
        });

        it('should pair consecutive USER and AGENT messages', async () => {
            const conversation = {
                id: 'conv-1',
                agent: { id: 'agent-1' },
            };
            mockConversationRepository.findOne.mockResolvedValue(conversation);
            mockConversationRepository.hasAgentAccess.mockResolvedValue(true);

            const date1 = new Date('2026-05-29T10:00:00Z');
            const date2 = new Date('2026-05-29T10:01:00Z');
            const date3 = new Date('2026-05-29T10:02:00Z');

            const messages = [
                { id: 'msg-1', sender: MessageSender.USER, content: 'Hello?', createdAt: date1 },
                { id: 'msg-2', sender: MessageSender.AGENT, content: 'Hi there!', createdAt: date2 },
                { id: 'msg-3', sender: MessageSender.USER, content: 'How are you?', createdAt: date3 },
            ];
            mockConversationRepository.findMessages.mockResolvedValue(messages);

            const result = await service.getMessages('user-1', 'conv-1');

            expect(result).toEqual([
                {
                    id: 'msg-1',
                    question: 'Hello?',
                    response: 'Hi there!',
                    timestamp: date1.getTime(),
                },
                {
                    id: 'msg-3',
                    question: 'How are you?',
                    response: '',
                    timestamp: date3.getTime(),
                },
            ]);
        });

        it('should handle USER message without AGENT response', async () => {
            const conversation = {
                id: 'conv-1',
                agent: { id: 'agent-1' },
            };
            mockConversationRepository.findOne.mockResolvedValue(conversation);
            mockConversationRepository.hasAgentAccess.mockResolvedValue(true);

            const date1 = new Date('2026-05-29T10:00:00Z');
            const messages = [{ id: 'msg-1', sender: MessageSender.USER, content: 'Question?', createdAt: date1 }];
            mockConversationRepository.findMessages.mockResolvedValue(messages);

            const result = await service.getMessages('user-1', 'conv-1');

            expect(result).toEqual([
                {
                    id: 'msg-1',
                    question: 'Question?',
                    response: '',
                    timestamp: date1.getTime(),
                },
            ]);
        });

        it('should ignore non-USER initial messages', async () => {
            const conversation = {
                id: 'conv-1',
                agent: { id: 'agent-1' },
            };
            mockConversationRepository.findOne.mockResolvedValue(conversation);
            mockConversationRepository.hasAgentAccess.mockResolvedValue(true);

            const date1 = new Date('2026-05-29T10:00:00Z');
            const date2 = new Date('2026-05-29T10:01:00Z');
            const messages = [
                { id: 'msg-1', sender: MessageSender.SYSTEM, content: 'Ignored', createdAt: date1 },
                { id: 'msg-2', sender: MessageSender.USER, content: 'Real question', createdAt: date2 },
            ];
            mockConversationRepository.findMessages.mockResolvedValue(messages);

            const result = await service.getMessages('user-1', 'conv-1');

            expect(result).toHaveLength(1);
            expect(result[0].question).toBe('Real question');
        });
    });

    describe('deleteConversation', () => {
        it('should throw NotFoundException when conversation not found', async () => {
            mockConversationRepository.findOne.mockResolvedValue(null);

            await expect(service.deleteConversation('user-1', 'conv-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user has no access', async () => {
            const conversation = {
                id: 'conv-1',
                agent: { id: 'agent-1' },
            };
            mockConversationRepository.findOne.mockResolvedValue(conversation);
            mockConversationRepository.hasAgentAccess.mockResolvedValue(false);

            await expect(service.deleteConversation('user-1', 'conv-1')).rejects.toThrow(ForbiddenException);
            expect(mockConversationRepository.delete).not.toHaveBeenCalled();
        });

        it('should call repository delete when authorized', async () => {
            const conversation = {
                id: 'conv-1',
                agent: { id: 'agent-1' },
            };
            mockConversationRepository.findOne.mockResolvedValue(conversation);
            mockConversationRepository.hasAgentAccess.mockResolvedValue(true);
            mockConversationRepository.delete.mockResolvedValue(undefined);

            await service.deleteConversation('user-1', 'conv-1');

            expect(mockConversationRepository.delete).toHaveBeenCalledWith('conv-1');
        });
    });
});
