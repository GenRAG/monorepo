import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageSender, QueryLogStatus } from 'generated/prisma';
import { EventEmitter } from 'events';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { MessageEvent } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { RagStreamForwarderService } from 'src/agent-runtime/rag-stream-forwarder.service';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';
import { ConversationRepository } from 'src/conversation/conversation.repository';

jest.mock('@sentry/nestjs');

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

function collectEvents(subscribe: (subscriber: any) => void): { events: MessageEvent[]; done: Promise<void> } {
    const events: MessageEvent[] = [];
    let complete!: () => void;
    const done = new Promise<void>((resolve) => (complete = resolve));
    subscribe({ next: (e: MessageEvent) => events.push(e), complete: () => complete() });
    return { events, done };
}

function parseData(event: MessageEvent): Record<string, unknown> {
    return JSON.parse(event.data as string) as Record<string, unknown>;
}

function createMockStream() {
    return new EventEmitter() as any;
}

function ndjson(events: Array<{ type: string; data: unknown }>): Buffer {
    return Buffer.from(events.map((e) => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
}

function tokenEvent(text: string): Buffer {
    return ndjson([{ type: 'token', data: text }]);
}

function costEvent(totalCostUsd: number): Buffer {
    return ndjson([{ type: 'cost_summary', data: { total_cost_usd: totalCostUsd } }]);
}

function statusEvent(text: string): Buffer {
    return ndjson([{ type: 'status', data: text }]);
}

const fakeLogCtx = { workspaceId: 'ws-1', agentId: 'agent-1', query: 'hello', startedAt: Date.now() };

const mockUsageTracker = { recordQuery: (jest.fn() as any).mockResolvedValue(undefined) };
const mockConversationRepo: any = {
    createMessage: jest.fn() as any,
    updateTimestamp: jest.fn() as any,
};

describe('RagStreamForwarderService', () => {
    let service: RagStreamForwarderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RagStreamForwarderService,
                { provide: UsageTrackerService, useValue: mockUsageTracker },
                { provide: ConversationRepository, useValue: mockConversationRepo },
            ],
        }).compile();

        service = module.get<RagStreamForwarderService>(RagStreamForwarderService);
        jest.clearAllMocks();
        mockUsageTracker.recordQuery.mockResolvedValue(undefined);
        mockConversationRepo.createMessage.mockResolvedValue({});
        mockConversationRepo.updateTimestamp.mockResolvedValue({});
    });

    describe('forward (usage-tracking only, e.g. playground)', () => {
        it('should forward chunk data to the subscriber', async () => {
            const mockStream = createMockStream();
            const { events, done } = collectEvents((subscriber) => service.forward(mockStream, subscriber));

            mockStream.emit('data', tokenEvent('Hello world'));
            mockStream.emit('end');
            await done;

            expect(parseData(events[0])).toEqual({ chunk: 'Hello world' });
        });

        it('should forward status updates to the subscriber as they arrive', async () => {
            const mockStream = createMockStream();
            const { events, done } = collectEvents((subscriber) => service.forward(mockStream, subscriber));

            mockStream.emit('data', statusEvent('Running block: retrieve'));
            mockStream.emit('data', statusEvent('retrieve completed'));
            mockStream.emit('data', tokenEvent('answer'));
            mockStream.emit('end');
            await done;

            expect(parseData(events[0])).toEqual({ status: 'Running block: retrieve' });
            expect(parseData(events[1])).toEqual({ status: 'retrieve completed' });
        });

        it('should send done:true and complete on stream end', async () => {
            const mockStream = createMockStream();
            const { events, done } = collectEvents((subscriber) => service.forward(mockStream, subscriber));

            mockStream.emit('data', tokenEvent('Hello world'));
            mockStream.emit('end');
            await done;

            expect(parseData(events[events.length - 1])).toEqual({ done: true });
        });

        it('should treat a stream that ends with no tokens as an error, without charging credits', async () => {
            const mockStream = createMockStream();
            const { events, done } = collectEvents((subscriber) =>
                service.forward(mockStream, subscriber, fakeLogCtx),
            );

            mockStream.emit('end');
            await done;
            await flushPromises();

            expect(parseData(events[events.length - 1])).toEqual({
                error: "L'assistant n'a pas pu générer de réponse. Veuillez réessayer.",
            });
            expect(mockUsageTracker.recordQuery).toHaveBeenCalledWith(
                expect.objectContaining({ status: QueryLogStatus.ERROR }),
            );
        });

        it('should not record usage when no logCtx is passed (e.g. skipUsageTracking)', async () => {
            const mockStream = createMockStream();
            const { done } = collectEvents((subscriber) => service.forward(mockStream, subscriber));

            mockStream.emit('end');
            await done;
            await flushPromises();

            expect(mockUsageTracker.recordQuery).not.toHaveBeenCalled();
        });

        it('should deduct credits on successful stream end', async () => {
            const mockStream = createMockStream();
            const { done } = collectEvents((subscriber) => service.forward(mockStream, subscriber, fakeLogCtx));

            mockStream.emit('data', tokenEvent('answer'));
            mockStream.emit('end');
            await done;
            await flushPromises();

            expect(mockUsageTracker.recordQuery).toHaveBeenCalledWith(
                expect.objectContaining({ workspaceId: 'ws-1', agentId: 'agent-1', status: QueryLogStatus.SUCCESS }),
            );
        });

        it('should convert the RAG engine cost_summary into creditsUsed', async () => {
            const mockStream = createMockStream();
            const { done } = collectEvents((subscriber) => service.forward(mockStream, subscriber, fakeLogCtx));

            mockStream.emit('data', tokenEvent('answer'));
            mockStream.emit('data', costEvent(0.014729510000000001));
            mockStream.emit('end');
            await done;
            await flushPromises();

            expect(mockUsageTracker.recordQuery).toHaveBeenCalledWith(expect.objectContaining({ creditsUsed: 111 }));
        });

        it('should pass through the message of a recognized business error (HttpException)', async () => {
            const mockStream = createMockStream();
            const { events, done } = collectEvents((subscriber) => service.forward(mockStream, subscriber));

            mockStream.emit('error', new NotFoundException('Workflow not configured'));
            await done;

            expect(parseData(events[events.length - 1])).toEqual({ error: 'Workflow not configured' });
        });

        it('should replace a non-HttpException stream error with a generic message and report it', async () => {
            const mockStream = createMockStream();
            const { events, done } = collectEvents((subscriber) => service.forward(mockStream, subscriber));

            mockStream.emit('error', new Error('socket hang up'));
            await done;

            expect(parseData(events[events.length - 1])).toEqual({
                error: 'Une erreur est survenue. Veuillez réessayer.',
            });
            expect(Sentry.captureException).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'socket hang up' }),
            );
        });
    });

    describe('forwardWithPersistence', () => {
        it('should accumulate chunks and persist the agent message on stream end', async () => {
            const mockStream = createMockStream();
            const { done } = collectEvents((subscriber) =>
                service.forwardWithPersistence(mockStream, 'conv-1', subscriber, fakeLogCtx),
            );

            mockStream.emit('data', tokenEvent('Hello '));
            mockStream.emit('data', tokenEvent('world'));
            mockStream.emit('end');
            await done;

            expect(mockConversationRepo.createMessage).toHaveBeenLastCalledWith({
                conversationId: 'conv-1',
                sender: MessageSender.AGENT,
                content: 'Hello world',
                metadata: { durationMs: expect.any(Number) },
            });
        });

        it('should send done with conversationId and durationMs on stream end', async () => {
            const mockStream = createMockStream();
            const { events, done } = collectEvents((subscriber) =>
                service.forwardWithPersistence(mockStream, 'conv-1', subscriber, fakeLogCtx),
            );

            mockStream.emit('data', tokenEvent('Hello world'));
            mockStream.emit('end');
            await done;

            expect(parseData(events[events.length - 1])).toEqual({
                done: true,
                conversationId: 'conv-1',
                durationMs: expect.any(Number),
            });
        });

        it('should bump the conversation updatedAt on success but not on error', async () => {
            const mockStream = createMockStream();
            const { done } = collectEvents((subscriber) =>
                service.forwardWithPersistence(mockStream, 'conv-1', subscriber, fakeLogCtx),
            );

            mockStream.emit('data', tokenEvent('Hello world'));
            mockStream.emit('end');
            await done;
            await flushPromises();

            expect(mockConversationRepo.updateTimestamp).toHaveBeenCalledWith('conv-1');
        });

        it('should deduct credits on stream end', async () => {
            const mockStream = createMockStream();
            const { done } = collectEvents((subscriber) =>
                service.forwardWithPersistence(mockStream, 'conv-1', subscriber, fakeLogCtx),
            );

            mockStream.emit('data', tokenEvent('Hello world'));
            mockStream.emit('end');
            await done;
            await flushPromises();

            expect(mockUsageTracker.recordQuery).toHaveBeenCalledWith(
                expect.objectContaining({ workspaceId: 'ws-1', agentId: 'agent-1', status: QueryLogStatus.SUCCESS }),
            );
        });

        it('should treat a stream that ends with no tokens as an error and persist a friendly message', async () => {
            const mockStream = createMockStream();
            const { done } = collectEvents((subscriber) =>
                service.forwardWithPersistence(mockStream, 'conv-1', subscriber, fakeLogCtx),
            );

            mockStream.emit('end');
            await done;
            await flushPromises();

            expect(mockUsageTracker.recordQuery).toHaveBeenCalledWith(
                expect.objectContaining({ status: QueryLogStatus.ERROR }),
            );
            expect(mockConversationRepo.createMessage).toHaveBeenLastCalledWith({
                conversationId: 'conv-1',
                sender: MessageSender.AGENT,
                content: "L'assistant n'a pas pu générer de réponse. Veuillez réessayer.",
                metadata: { durationMs: expect.any(Number) },
            });
        });

        it('should send a sanitized error event and persist partial text on stream error', async () => {
            const mockStream = createMockStream();
            const { events, done } = collectEvents((subscriber) =>
                service.forwardWithPersistence(mockStream, 'conv-1', subscriber, fakeLogCtx),
            );

            mockStream.emit('data', tokenEvent('Partial'));
            mockStream.emit('error', new Error('Stream aborted'));
            await done;

            expect(parseData(events[events.length - 1])).toEqual({
                error: 'Une erreur est survenue. Veuillez réessayer.',
            });
            expect(mockConversationRepo.createMessage).toHaveBeenLastCalledWith({
                conversationId: 'conv-1',
                sender: MessageSender.AGENT,
                content: 'Partial',
                metadata: { durationMs: expect.any(Number) },
            });
        });

        it('should persist the sanitized error message when there is no partial text to fall back on', async () => {
            const mockStream = createMockStream();
            const { done } = collectEvents((subscriber) =>
                service.forwardWithPersistence(mockStream, 'conv-1', subscriber, fakeLogCtx),
            );

            mockStream.emit('error', new Error('Internal orchestrator failure'));
            await done;

            expect(mockConversationRepo.createMessage).toHaveBeenLastCalledWith({
                conversationId: 'conv-1',
                sender: MessageSender.AGENT,
                content: 'Une erreur est survenue. Veuillez réessayer.',
                metadata: { durationMs: expect.any(Number) },
            });
        });
    });
});
