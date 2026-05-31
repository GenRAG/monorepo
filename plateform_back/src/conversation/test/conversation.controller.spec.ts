import { BadRequestException } from '@nestjs/common';
import { ConversationController } from '../conversation.controller';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockConversationService: any = {
    getAssistants: jest.fn(),
    getAssistantMetadata: jest.fn(),
    getConversations: jest.fn(),
    getMessages: jest.fn(),
    deleteConversation: jest.fn(),
};

const mockAgentRuntimeService: any = {
    streamWithPersistence: jest.fn(),
};

const fakeUser = { id: 'user-1' } as any;

describe('ConversationController', () => {
    let controller: ConversationController;

    beforeEach(() => {
        controller = new ConversationController(mockConversationService, mockAgentRuntimeService);
        jest.clearAllMocks();
    });

    describe('getAssistants', () => {
        it('should delegate to service with user id', async () => {
            const assistants = [
                { id: 'agent-1', title: 'Support Bot', sharedBy: 'Workspace A', updatedAt: '2026-05-29T10:00:00Z' },
            ];
            mockConversationService.getAssistants.mockResolvedValue(assistants);

            const result = await controller.getAssistants(fakeUser);

            expect(mockConversationService.getAssistants).toHaveBeenCalledWith('user-1');
            expect(result).toEqual(assistants);
        });
    });

    describe('getAssistantMetadata', () => {
        it('should delegate to service', async () => {
            const metadata = { id: 'agent-1', title: 'Support Bot', sharedBy: 'Workspace A' };
            mockConversationService.getAssistantMetadata.mockResolvedValue(metadata);

            const result = await controller.getAssistantMetadata('agent-1');

            expect(mockConversationService.getAssistantMetadata).toHaveBeenCalledWith('agent-1');
            expect(result).toEqual(metadata);
        });
    });

    describe('getConversations', () => {
        it('should delegate to service with user and agent ids', async () => {
            const conversations = [
                { id: 'conv-1', title: 'First Chat', lastMessage: 'Hello', updatedAt: '2026-05-29T10:00:00Z' },
            ];
            mockConversationService.getConversations.mockResolvedValue(conversations);

            const result = await controller.getConversations('agent-1', fakeUser);

            expect(mockConversationService.getConversations).toHaveBeenCalledWith('user-1', 'agent-1');
            expect(result).toEqual(conversations);
        });
    });

    describe('stream', () => {
        it('should throw BadRequestException when query is missing', () => {
            expect(() => controller.stream('agent-1', '', fakeUser)).toThrow(BadRequestException);
            expect(mockAgentRuntimeService.streamWithPersistence).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when query is undefined', () => {
            expect(() => controller.stream('agent-1', undefined as any, fakeUser)).toThrow(BadRequestException);
        });

        it('should delegate to agentRuntimeService with all parameters', () => {
            const stream = { on: jest.fn() };
            mockAgentRuntimeService.streamWithPersistence.mockReturnValue(stream);

            const result = controller.stream('agent-1', 'Hello?', fakeUser, 'conv-1');

            expect(mockAgentRuntimeService.streamWithPersistence).toHaveBeenCalledWith(
                'agent-1',
                'Hello?',
                'conv-1',
                'user-1',
            );
            expect(result).toEqual(stream);
        });

        it('should delegate without conversationId when not provided', () => {
            const stream = { on: jest.fn() };
            mockAgentRuntimeService.streamWithPersistence.mockReturnValue(stream);

            const result = controller.stream('agent-1', 'Hello?', fakeUser);

            expect(mockAgentRuntimeService.streamWithPersistence).toHaveBeenCalledWith(
                'agent-1',
                'Hello?',
                undefined,
                'user-1',
            );
            expect(result).toEqual(stream);
        });
    });

    describe('getMessages', () => {
        it('should delegate to service with user and conversation ids', async () => {
            const messages = [{ id: 'msg-1', question: 'Hello?', response: 'Hi!', timestamp: 1000 }];
            mockConversationService.getMessages.mockResolvedValue(messages);

            const result = await controller.getMessages('conv-1', fakeUser);

            expect(mockConversationService.getMessages).toHaveBeenCalledWith('user-1', 'conv-1');
            expect(result).toEqual(messages);
        });
    });

    describe('deleteConversation', () => {
        it('should delegate to service with user and conversation ids', async () => {
            mockConversationService.deleteConversation.mockResolvedValue(undefined);

            await controller.deleteConversation('conv-1', fakeUser);

            expect(mockConversationService.deleteConversation).toHaveBeenCalledWith('user-1', 'conv-1');
        });
    });
});
