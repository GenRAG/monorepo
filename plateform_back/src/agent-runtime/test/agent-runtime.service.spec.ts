import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentStatus, MessageSender } from 'generated/prisma';
import { EventEmitter } from 'events';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { MessageEvent } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { AgentRuntimeService } from 'src/agent-runtime/agent-runtime.service';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { PrismaService } from 'src/prisma/prisma.service';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

function collectEvents(obs: Observable<MessageEvent>): { events: MessageEvent[]; done: Promise<void> } {
    const events: MessageEvent[] = [];
    const done = new Promise<void>((resolve) => {
        obs.subscribe({ next: (e) => events.push(e), complete: resolve });
    });
    return { events, done };
}

function parseData(event: MessageEvent): Record<string, unknown> {
    return JSON.parse(event.data as string) as Record<string, unknown>;
}

function createMockStream() {
    const stream = new EventEmitter() as any;
    stream.destroy = jest.fn();
    return stream;
}

const fakeAgent = {
    id: 'agent-1',
    workspaceId: 'ws-1',
    status: AgentStatus.PRODUCTION,
};

const fakeConversation = {
    id: 'conv-1',
    agentId: 'agent-1',
    workspaceId: 'ws-1',
    title: 'Test',
};

const mockOrchestrator = {
    streamQuery: jest.fn() as any,
};

const mockPrisma = {
    agent: { findUnique: jest.fn() as any },
    conversation: {
        findUnique: jest.fn() as any,
        create: jest.fn() as any,
        update: jest.fn() as any,
    },
    message: { create: jest.fn() as any },
};

describe('AgentRuntimeService', () => {
    let service: AgentRuntimeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgentRuntimeService,
                { provide: AgentRuntimeOrchestrator, useValue: mockOrchestrator },
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<AgentRuntimeService>(AgentRuntimeService);
        jest.clearAllMocks();
    });

    describe('streamQuery — _forwardStream', () => {
        it('should forward chunk data to subscriber', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { events, done } = collectEvents(service.streamQuery('ws-1', 'agent-1', 'hello'));
            await flushPromises();

            mockStream.emit('data', Buffer.from('Hello world'));
            mockStream.emit('end');
            await done;

            expect(parseData(events[0])).toEqual({ chunk: 'Hello world' });
        });

        it('should send done:true and complete on stream end', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { events, done } = collectEvents(service.streamQuery('ws-1', 'agent-1', 'hello'));
            await flushPromises();

            mockStream.emit('end');
            await done;

            expect(parseData(events[0])).toEqual({ done: true });
        });

        it('should send error message and complete on stream error', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { events, done } = collectEvents(service.streamQuery('ws-1', 'agent-1', 'hello'));
            await flushPromises();

            mockStream.emit('error', new Error('RAG failure'));
            await done;

            expect(parseData(events[0])).toEqual({ error: 'RAG failure' });
        });

        it('should send isOutOfCredits:true when ForbiddenException is thrown', async () => {
            mockOrchestrator.streamQuery.mockRejectedValue(new ForbiddenException('No credits'));

            const { events, done } = collectEvents(service.streamQuery('ws-1', 'agent-1', 'hello'));
            await done;

            const data = parseData(events[0]);
            expect(data.isOutOfCredits).toBe(true);
            expect(data.error).toBe('Pas de crédits disponibles.');
        });

        it('should send error message when non-Forbidden error is thrown', async () => {
            mockOrchestrator.streamQuery.mockRejectedValue(new Error('Timeout'));

            const { events, done } = collectEvents(service.streamQuery('ws-1', 'agent-1', 'hello'));
            await done;

            const data = parseData(events[0]);
            expect(data.isOutOfCredits).toBe(false);
            expect(data.error).toBe('Timeout');
        });
    });

    describe('playgroundStream', () => {
        it('should pass skipUsageTracking=true and forceActiveWorkflow=true to orchestrator', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { done } = collectEvents(service.playgroundStream('ws-1', 'agent-1', 'test'));
            await flushPromises();
            mockStream.emit('end');
            await done;

            expect(mockOrchestrator.streamQuery).toHaveBeenCalledWith(
                expect.objectContaining({ skipUsageTracking: true, forceActiveWorkflow: true }),
            );
        });
    });

    describe('streamWithPersistence — _resolveWorkspaceId', () => {
        it('should send error and complete when agent is not found', async () => {
            mockPrisma.agent.findUnique.mockResolvedValue(null);

            const { events, done } = collectEvents(service.streamWithPersistence('agent-1', 'hello'));
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Assistant not found' });
        });

        it('should send error and complete when agent is not in PRODUCTION', async () => {
            mockPrisma.agent.findUnique.mockResolvedValue({
                ...fakeAgent,
                status: AgentStatus.DEVELOPMENT,
            });

            const { events, done } = collectEvents(service.streamWithPersistence('agent-1', 'hello'));
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Assistant not available' });
        });
    });

    describe('streamWithPersistence — _initConversation', () => {
        beforeEach(() => {
            mockPrisma.agent.findUnique.mockResolvedValue(fakeAgent);
            mockOrchestrator.streamQuery.mockResolvedValue(createMockStream());
        });

        it('should send error when conversationId not found', async () => {
            mockPrisma.conversation.findUnique.mockResolvedValue(null);

            const { events, done } = collectEvents(service.streamWithPersistence('agent-1', 'hello', 'unknown-conv'));
            await flushPromises();
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Conversation not found' });
        });

        it('should send error when conversation belongs to a different agent', async () => {
            mockPrisma.conversation.findUnique.mockResolvedValue({
                ...fakeConversation,
                agentId: 'other-agent',
            });

            const { events, done } = collectEvents(service.streamWithPersistence('agent-1', 'hello', 'conv-1'));
            await flushPromises();
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Conversation not found' });
        });

        it('should create a new conversation when no conversationId is provided', async () => {
            mockPrisma.conversation.create.mockResolvedValue(fakeConversation);
            mockPrisma.message.create.mockResolvedValue({});

            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { done } = collectEvents(service.streamWithPersistence('agent-1', 'hello'));
            await flushPromises();
            mockStream.emit('end');
            await done;

            expect(mockPrisma.conversation.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ agentId: 'agent-1', workspaceId: 'ws-1' }),
            });
        });

        it('should persist the user message after creating conversation', async () => {
            mockPrisma.conversation.create.mockResolvedValue(fakeConversation);
            mockPrisma.message.create.mockResolvedValue({});

            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { done } = collectEvents(service.streamWithPersistence('agent-1', 'hello'));
            await flushPromises();
            mockStream.emit('end');
            await done;

            expect(mockPrisma.message.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    conversationId: 'conv-1',
                    sender: MessageSender.USER,
                    content: 'hello',
                }),
            });
        });
    });

    describe('streamWithPersistence — _forwardStreamWithPersistence', () => {
        beforeEach(() => {
            mockPrisma.agent.findUnique.mockResolvedValue(fakeAgent);
            mockPrisma.conversation.create.mockResolvedValue(fakeConversation);
            mockPrisma.message.create.mockResolvedValue({});
            mockPrisma.conversation.update.mockResolvedValue(fakeConversation);
        });

        it('should accumulate chunks and persist agent message on stream end', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { done } = collectEvents(service.streamWithPersistence('agent-1', 'hello'));
            await flushPromises();

            mockStream.emit('data', Buffer.from('Hello '));
            mockStream.emit('data', Buffer.from('world'));
            mockStream.emit('end');
            await done;

            expect(mockPrisma.message.create).toHaveBeenLastCalledWith({
                data: expect.objectContaining({
                    conversationId: 'conv-1',
                    sender: MessageSender.AGENT,
                    content: 'Hello world',
                }),
            });
        });

        it('should send done with conversationId on stream end', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { events, done } = collectEvents(service.streamWithPersistence('agent-1', 'hello'));
            await flushPromises();

            mockStream.emit('end');
            await done;

            const lastEvent = parseData(events[events.length - 1]);
            expect(lastEvent).toEqual({ done: true, conversationId: 'conv-1' });
        });

        it('should send error event and persist partial text on stream error', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { events, done } = collectEvents(service.streamWithPersistence('agent-1', 'hello'));
            await flushPromises();

            mockStream.emit('data', Buffer.from('Partial'));
            mockStream.emit('error', new Error('Stream aborted'));
            await done;

            const lastEvent = parseData(events[events.length - 1]);
            expect(lastEvent).toEqual({ error: 'Stream aborted' });

            expect(mockPrisma.message.create).toHaveBeenLastCalledWith({
                data: expect.objectContaining({
                    sender: MessageSender.AGENT,
                    content: 'Partial',
                }),
            });
        });

        it('should destroy the RAG stream if _initConversation fails', async () => {
            mockPrisma.conversation.create.mockRejectedValue(new Error('DB error'));
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { done } = collectEvents(service.streamWithPersistence('agent-1', 'hello'));
            await flushPromises();
            await done;

            expect(mockStream.destroy).toHaveBeenCalled();
        });
    });
});
