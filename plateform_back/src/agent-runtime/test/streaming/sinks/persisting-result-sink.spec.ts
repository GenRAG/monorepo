import { Logger } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { MessageSender, QueryLogStatus } from 'generated/prisma';
import { PersistingResultSink } from 'src/agent-runtime/streaming/sinks/persisting-result-sink';
import { RuntimeUsageRecorder } from 'src/agent-runtime/usage/runtime-usage-recorder';
import { ConversationRepository } from 'src/conversation/conversation.repository';

function parseData(event: unknown): Record<string, unknown> {
    return JSON.parse((event as { data: string }).data) as Record<string, unknown>;
}

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

const fakeLogCtx = { workspaceId: 'ws-1', agentId: 'agent-1', query: 'hello', startedAt: Date.now() };

describe('PersistingResultSink', () => {
    let subscriber: { next: jest.Mock; complete: jest.Mock };
    let usageRecorder: { recordSafely: jest.Mock };
    let conversationRepo: { createMessage: jest.Mock; updateTimestamp: jest.Mock };
    const logger = new Logger('test');

    const build = () =>
        new PersistingResultSink(
            subscriber as any,
            'conv-1',
            fakeLogCtx,
            usageRecorder as unknown as RuntimeUsageRecorder,
            conversationRepo as unknown as ConversationRepository,
            logger,
        );

    beforeEach(() => {
        subscriber = { next: jest.fn(), complete: jest.fn() };
        usageRecorder = { recordSafely: jest.fn() };
        conversationRepo = {
            createMessage: jest.fn<any>().mockResolvedValue({}),
            updateTimestamp: jest.fn<any>().mockResolvedValue({}),
        };
    });

    it('accumulates chunks and persists the agent message on stream end', async () => {
        await build().onCompleted({ kind: 'end', fullText: 'Hello world' });

        expect(conversationRepo.createMessage).toHaveBeenLastCalledWith({
            conversationId: 'conv-1',
            sender: MessageSender.AGENT,
            content: 'Hello world',
            metadata: { durationMs: expect.any(Number) },
        });
    });

    it('sends done with conversationId and durationMs on stream end', async () => {
        await build().onCompleted({ kind: 'end', fullText: 'Hello world' });

        expect(parseData(subscriber.next.mock.calls[0][0])).toEqual({
            done: true,
            conversationId: 'conv-1',
            durationMs: expect.any(Number),
        });
        expect(subscriber.complete).toHaveBeenCalled();
    });

    it('bumps the conversation updatedAt on success but not on error', async () => {
        await build().onCompleted({ kind: 'end', fullText: 'Hello world' });
        await flushPromises();

        expect(conversationRepo.updateTimestamp).toHaveBeenCalledWith('conv-1');
    });

    it('deducts credits on stream end', async () => {
        await build().onCompleted({ kind: 'end', fullText: 'Hello world' });

        expect(usageRecorder.recordSafely).toHaveBeenCalledWith(
            expect.objectContaining({ workspaceId: 'ws-1', agentId: 'agent-1', status: QueryLogStatus.SUCCESS }),
        );
    });

    it('treats a stream that ends with no tokens as an error and persists a friendly message', async () => {
        await build().onCompleted({ kind: 'end', fullText: '' });

        expect(usageRecorder.recordSafely).toHaveBeenCalledWith(
            expect.objectContaining({ status: QueryLogStatus.ERROR }),
        );
        expect(conversationRepo.createMessage).toHaveBeenLastCalledWith({
            conversationId: 'conv-1',
            sender: MessageSender.AGENT,
            content: "L'assistant n'a pas pu générer de réponse. Veuillez réessayer.",
            metadata: { durationMs: expect.any(Number) },
        });
        expect(conversationRepo.updateTimestamp).not.toHaveBeenCalled();
    });

    it('sends a sanitized error event and persists partial text on stream error', async () => {
        await build().onCompleted({ kind: 'error', error: new Error('Stream aborted'), fullText: 'Partial' });

        expect(parseData(subscriber.next.mock.calls[0][0])).toEqual({
            error: 'Une erreur est survenue. Veuillez réessayer.',
        });
        expect(conversationRepo.createMessage).toHaveBeenLastCalledWith({
            conversationId: 'conv-1',
            sender: MessageSender.AGENT,
            content: 'Partial',
            metadata: { durationMs: expect.any(Number) },
        });
    });

    it('persists the sanitized error message when there is no partial text to fall back on', async () => {
        await build().onCompleted({ kind: 'error', error: new Error('Internal orchestrator failure'), fullText: '' });

        expect(conversationRepo.createMessage).toHaveBeenLastCalledWith({
            conversationId: 'conv-1',
            sender: MessageSender.AGENT,
            content: 'Une erreur est survenue. Veuillez réessayer.',
            metadata: { durationMs: expect.any(Number) },
        });
    });

    it('includes citedSources in the persisted metadata when present', async () => {
        const citedSources = [{ index: 0, title: 'doc.pdf', score: 0.9 }];

        await build().onCompleted({ kind: 'end', fullText: 'Hello world', citedSources });

        expect(conversationRepo.createMessage).toHaveBeenLastCalledWith(
            expect.objectContaining({ metadata: expect.objectContaining({ sources: citedSources }) }),
        );
    });
});
