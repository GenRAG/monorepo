import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentStatus, MessageSender } from 'generated/prisma';
import { EventEmitter } from 'events';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { MessageEvent } from '@nestjs/common';
import type { Observable, Subscriber } from 'rxjs';
import * as Sentry from '@sentry/nestjs';
import { AgentRuntimeService } from 'src/agent-runtime/agent-runtime.service';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { RagStreamForwarderService } from 'src/agent-runtime/streaming/rag-stream-forwarder.service';
import { RuntimeSinkFactory } from 'src/agent-runtime/streaming/sinks/runtime-sink.factory';
import { RuntimeUsageRecorder } from 'src/agent-runtime/usage/runtime-usage-recorder';

jest.mock('@sentry/nestjs');

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

/** A minimal stand-in for a real `RuntimeResultSink` — good enough to verify the service wires the
 * right stream to the right sink, without re-testing the sinks' own behavior (see their own specs). */
function createFakeSink(subscriber: Subscriber<MessageEvent>) {
    return {
        emit: jest.fn(),
        onCompleted: jest.fn(() => subscriber.complete()),
    };
}

const fakeAgent = { id: 'agent-1', workspaceId: 'ws-1', status: AgentStatus.PRODUCTION };
const fakeConversation = { id: 'conv-1', agentId: 'agent-1', workspaceId: 'ws-1', title: 'Test', userId: 'user-1' };

const mockOrchestrator = { streamQuery: jest.fn() as any };
const mockPrisma: any = {
    agent: { findUnique: jest.fn() as any },
};
const mockConversationRepo: any = {
    hasAgentAccess: jest.fn() as any,
    findOne: jest.fn() as any,
    // Runs the callback with a dummy "tx" token — good enough to verify create()/
    // createMessage() are called through it, without needing a real Prisma transaction.
    transaction: jest.fn((cb: (tx: unknown) => unknown) => cb('tx')) as any,
    create: jest.fn() as any,
    createMessage: jest.fn() as any,
};
const mockStreamForwarder: any = { forward: jest.fn() as any };
const mockSinkFactory: any = {
    createTransient: jest.fn((subscriber: Subscriber<MessageEvent>) => createFakeSink(subscriber)),
    createPersisting: jest.fn((subscriber: Subscriber<MessageEvent>) => createFakeSink(subscriber)),
};
const mockUsageRecorder: any = { recordSafely: jest.fn() };

describe('AgentRuntimeService', () => {
    let service: AgentRuntimeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgentRuntimeService,
                { provide: AgentRuntimeOrchestrator, useValue: mockOrchestrator },
                { provide: PrismaService, useValue: mockPrisma },
                { provide: ConversationRepository, useValue: mockConversationRepo },
                { provide: RagStreamForwarderService, useValue: mockStreamForwarder },
                { provide: RuntimeSinkFactory, useValue: mockSinkFactory },
                { provide: RuntimeUsageRecorder, useValue: mockUsageRecorder },
            ],
        }).compile();

        service = module.get<AgentRuntimeService>(AgentRuntimeService);
        jest.clearAllMocks();
        mockConversationRepo.hasAgentAccess.mockResolvedValue(true);
        mockConversationRepo.transaction.mockImplementation((cb: (tx: unknown) => unknown) => cb('tx'));
        mockSinkFactory.createTransient.mockImplementation((subscriber: Subscriber<MessageEvent>) =>
            createFakeSink(subscriber),
        );
        mockSinkFactory.createPersisting.mockImplementation((subscriber: Subscriber<MessageEvent>) =>
            createFakeSink(subscriber),
        );
    });

    describe('playgroundStream', () => {
        it('should pass forceActiveWorkflow:true to orchestrator', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            service.playgroundStream('ws-1', 'agent-1', 'test').subscribe();
            await flushPromises();

            expect(mockOrchestrator.streamQuery).toHaveBeenCalledWith(
                expect.objectContaining({ forceActiveWorkflow: true }),
            );
        });

        it('should build a transient sink with a usage-tracking logCtx and hand it the resolved stream', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            service.playgroundStream('ws-1', 'agent-1', 'hello').subscribe();
            await flushPromises();

            expect(mockSinkFactory.createTransient).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ workspaceId: 'ws-1', agentId: 'agent-1', query: 'hello' }),
            );
            expect(mockStreamForwarder.forward).toHaveBeenCalledWith(
                mockStream,
                mockSinkFactory.createTransient.mock.results[0].value,
            );
        });

        it('should send isOutOfCredits:true when ForbiddenException is thrown', async () => {
            mockOrchestrator.streamQuery.mockRejectedValue(new ForbiddenException('No credits'));

            const { events, done } = collectEvents(service.playgroundStream('ws-1', 'agent-1', 'hello'));
            await done;

            const data = parseData(events[0]);
            expect(data.isOutOfCredits).toBe(true);
            expect(data.error).toBe('Insufficient credits.');
        });

        it('should pass through the message of a recognized business error (HttpException)', async () => {
            mockOrchestrator.streamQuery.mockRejectedValue(new NotFoundException('Workflow not configured'));

            const { events, done } = collectEvents(service.playgroundStream('ws-1', 'agent-1', 'hello'));
            await done;

            const data = parseData(events[0]);
            expect(data.isOutOfCredits).toBe(false);
            expect(data.error).toBe('Workflow not configured');
        });

        it('should replace a non-HttpException error message with a generic one, and log/report the real one', async () => {
            mockOrchestrator.streamQuery.mockRejectedValue(new Error('ECONNRESET at 10.0.0.1:8000'));

            const { events, done } = collectEvents(service.playgroundStream('ws-1', 'agent-1', 'hello'));
            await done;

            const data = parseData(events[0]);
            expect(data.isOutOfCredits).toBe(false);
            expect(data.error).toBe('Une erreur est survenue. Veuillez réessayer.');
            expect(data.error).not.toContain('ECONNRESET');
            expect(Sentry.captureException).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('ECONNRESET') }),
            );
        });

        it('should record a failed query log when the RAG stream fails to start', async () => {
            mockOrchestrator.streamQuery.mockRejectedValue(new ForbiddenException('No credits'));

            const { done } = collectEvents(service.playgroundStream('ws-1', 'agent-1', 'hello'));
            await done;

            expect(mockUsageRecorder.recordSafely).toHaveBeenCalledWith(
                expect.objectContaining({ workspaceId: 'ws-1', agentId: 'agent-1' }),
            );
        });
    });

    describe('streamWithOrgOverride', () => {
        it('should pass orgIdOverride to orchestrator without skipping usage tracking', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            service.streamWithOrgOverride('ws-1', 'agent-1', 'test', 'org-x').subscribe();
            await flushPromises();

            expect(mockOrchestrator.streamQuery).toHaveBeenCalledWith(
                expect.objectContaining({ orgIdOverride: 'org-x', skipUsageTracking: false }),
            );
        });

        it('should build a transient sink with a defined logCtx so the query still gets billed', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            service.streamWithOrgOverride('ws-1', 'agent-1', 'test', 'org-x').subscribe();
            await flushPromises();

            expect(mockSinkFactory.createTransient).toHaveBeenCalledWith(expect.anything(), expect.any(Object));
            expect(mockStreamForwarder.forward).toHaveBeenCalledWith(mockStream, expect.anything());
        });
    });

    describe('streamWithPersistence — access control', () => {
        it('should deny access and never start a stream when no userId is provided', async () => {
            const { events, done } = collectEvents(service.streamWithPersistence('agent-1', 'hello'));
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Access denied' });
            expect(mockOrchestrator.streamQuery).not.toHaveBeenCalled();
        });

        it('should deny access when the user has no access to the agent', async () => {
            mockConversationRepo.hasAgentAccess.mockResolvedValue(false);

            const { events, done } = collectEvents(
                service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1'),
            );
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Access denied' });
            expect(mockOrchestrator.streamQuery).not.toHaveBeenCalled();
        });
    });

    describe('streamWithPersistence — _resolveWorkspaceId', () => {
        it('should send error and complete when agent is not found', async () => {
            mockPrisma.agent.findUnique.mockResolvedValue(null);

            const { events, done } = collectEvents(
                service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1'),
            );
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Assistant not found' });
        });

        it('should send error and complete when agent is not in PRODUCTION', async () => {
            mockPrisma.agent.findUnique.mockResolvedValue({ ...fakeAgent, status: AgentStatus.DEVELOPMENT });

            const { events, done } = collectEvents(
                service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1'),
            );
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
            mockConversationRepo.findOne.mockResolvedValue(null);

            const { events, done } = collectEvents(
                service.streamWithPersistence('agent-1', 'hello', 'unknown-conv', 'user-1'),
            );
            await flushPromises();
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Conversation not found' });
        });

        it('should send error when conversation belongs to a different agent', async () => {
            mockConversationRepo.findOne.mockResolvedValue({ ...fakeConversation, agentId: 'other-agent' });

            const { events, done } = collectEvents(
                service.streamWithPersistence('agent-1', 'hello', 'conv-1', 'user-1'),
            );
            await flushPromises();
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Conversation not found' });
        });

        it('should send error when conversation belongs to a different user', async () => {
            mockConversationRepo.findOne.mockResolvedValue({ ...fakeConversation, userId: 'someone-else' });

            const { events, done } = collectEvents(
                service.streamWithPersistence('agent-1', 'hello', 'conv-1', 'user-1'),
            );
            await flushPromises();
            await done;

            expect(parseData(events[0])).toEqual({ error: 'Conversation not found' });
        });

        it('should create a new conversation when no conversationId is provided', async () => {
            mockConversationRepo.create.mockResolvedValue(fakeConversation);
            mockConversationRepo.createMessage.mockResolvedValue({});

            service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1').subscribe();
            await flushPromises();

            expect(mockConversationRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ agentId: 'agent-1', workspaceId: 'ws-1', userId: 'user-1' }),
                'tx',
            );
        });
    });

    describe('_initConversation — transactional creation', () => {
        beforeEach(() => {
            mockPrisma.agent.findUnique.mockResolvedValue(fakeAgent);
            mockOrchestrator.streamQuery.mockResolvedValue(createMockStream());
        });

        it('should create the conversation and the first USER message inside a single transaction', async () => {
            mockConversationRepo.create.mockResolvedValue(fakeConversation);
            mockConversationRepo.createMessage.mockResolvedValue({});

            service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1').subscribe();
            await flushPromises();

            expect(mockConversationRepo.transaction).toHaveBeenCalledTimes(1);
            expect(mockConversationRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({ agentId: 'agent-1', workspaceId: 'ws-1' }),
                'tx',
            );
            expect(mockConversationRepo.createMessage).toHaveBeenCalledWith(
                expect.objectContaining({ sender: MessageSender.USER, content: 'hello' }),
                'tx',
            );
        });

        it('should not leave an orphaned conversation if the USER message insert fails', async () => {
            mockConversationRepo.create.mockResolvedValue(fakeConversation);
            mockConversationRepo.createMessage.mockRejectedValue(new Error('message insert failed'));
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { events, done } = collectEvents(
                service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1'),
            );
            await flushPromises();
            await done;

            // the failure must be surfaced through the same transaction() call that
            // created the conversation, not persisted as a bare, message-less conversation
            expect(mockConversationRepo.transaction).toHaveBeenCalledTimes(1);
            expect(mockStream.destroy).toHaveBeenCalled();
            expect(parseData(events[events.length - 1])).toEqual({
                error: 'Une erreur est survenue. Veuillez réessayer.',
            });
        });

        it('should wrap the existing-conversation USER message creation in a transaction too', async () => {
            mockConversationRepo.findOne.mockResolvedValue(fakeConversation);
            mockConversationRepo.createMessage.mockResolvedValue({});

            service.streamWithPersistence('agent-1', 'hello', 'conv-1', 'user-1').subscribe();
            await flushPromises();

            expect(mockConversationRepo.create).not.toHaveBeenCalled();
            expect(mockConversationRepo.transaction).toHaveBeenCalledTimes(1);
            expect(mockConversationRepo.createMessage).toHaveBeenCalledWith(
                expect.objectContaining({ conversationId: 'conv-1', sender: MessageSender.USER, content: 'hello' }),
                'tx',
            );
        });

        it('should destroy the RAG stream if _initConversation fails', async () => {
            mockConversationRepo.create.mockRejectedValue(new Error('DB error: constraint violation'));
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const { events, done } = collectEvents(
                service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1'),
            );
            await flushPromises();
            await done;

            expect(mockStream.destroy).toHaveBeenCalled();
            // the raw Prisma error must not leak to the client
            expect(parseData(events[events.length - 1])).toEqual({
                error: 'Une erreur est survenue. Veuillez réessayer.',
            });
        });
    });

    describe('streamWithPersistence — dispatch to the forwarder', () => {
        beforeEach(() => {
            mockPrisma.agent.findUnique.mockResolvedValue(fakeAgent);
            mockConversationRepo.create.mockResolvedValue(fakeConversation);
            mockConversationRepo.createMessage.mockResolvedValue({});
        });

        it('should build a persisting sink with the conversation id and logCtx, and forward the RAG stream to it', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1').subscribe();
            await flushPromises();

            expect(mockSinkFactory.createPersisting).toHaveBeenCalledWith(
                expect.anything(),
                'conv-1',
                expect.objectContaining({ workspaceId: 'ws-1', agentId: 'agent-1', query: 'hello' }),
            );
            expect(mockStreamForwarder.forward).toHaveBeenCalledWith(
                mockStream,
                mockSinkFactory.createPersisting.mock.results[0].value,
            );
        });

        it('should not record a failed query log when the RAG stream fails to start (pre-existing quirk, preserved)', async () => {
            mockOrchestrator.streamQuery.mockRejectedValue(new Error('boom'));

            const { done } = collectEvents(service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1'));
            await done;

            expect(mockUsageRecorder.recordSafely).not.toHaveBeenCalled();
        });
    });

    describe('client-disconnect teardown', () => {
        it('should destroy the RAG stream when the client unsubscribes before completion (playgroundStream)', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const subscription = service.playgroundStream('ws-1', 'agent-1', 'hello').subscribe();
            await flushPromises();

            subscription.unsubscribe();

            expect(mockStream.destroy).toHaveBeenCalled();
        });

        it('should destroy the RAG stream when the client unsubscribes before completion (streamWithPersistence)', async () => {
            mockPrisma.agent.findUnique.mockResolvedValue(fakeAgent);
            mockConversationRepo.create.mockResolvedValue(fakeConversation);
            mockConversationRepo.createMessage.mockResolvedValue({});
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);

            const subscription = service.streamWithPersistence('agent-1', 'hello', undefined, 'user-1').subscribe();
            await flushPromises();

            subscription.unsubscribe();

            expect(mockStream.destroy).toHaveBeenCalled();
        });

        it('should not throw when unsubscribing before the RAG stream is created', () => {
            mockOrchestrator.streamQuery.mockImplementation(() => new Promise(() => {}));

            const subscription = service.playgroundStream('ws-1', 'agent-1', 'hello').subscribe();

            expect(() => subscription.unsubscribe()).not.toThrow();
        });

        it('should not call destroy again on a stream that already reports itself destroyed after completion', async () => {
            const mockStream = createMockStream();
            mockOrchestrator.streamQuery.mockResolvedValue(mockStream);
            // simulate the forwarder reaching the end of the stream and completing the subscriber via the sink
            mockStreamForwarder.forward.mockImplementation(
                (stream: typeof mockStream, sink: { onCompleted: () => void }) => {
                    stream.destroyed = true;
                    sink.onCompleted();
                },
            );

            const { done } = collectEvents(service.playgroundStream('ws-1', 'agent-1', 'hello'));
            await done;

            expect(mockStream.destroy).not.toHaveBeenCalled();
        });
    });
});
