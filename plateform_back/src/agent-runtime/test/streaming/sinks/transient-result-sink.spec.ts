import { NotFoundException, Logger } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { QueryLogStatus } from 'generated/prisma';
import * as Sentry from '@sentry/nestjs';
import { TransientResultSink } from 'src/agent-runtime/streaming/sinks/transient-result-sink';
import { RuntimeUsageRecorder } from 'src/agent-runtime/usage/runtime-usage-recorder';

jest.mock('@sentry/nestjs');

function parseData(event: unknown): Record<string, unknown> {
    return JSON.parse((event as { data: string }).data) as Record<string, unknown>;
}

const fakeLogCtx = { workspaceId: 'ws-1', agentId: 'agent-1', query: 'hello', startedAt: Date.now() };

describe('TransientResultSink', () => {
    let subscriber: { next: jest.Mock; complete: jest.Mock };
    let usageRecorder: { recordSafely: jest.Mock };
    const logger = new Logger('test');

    beforeEach(() => {
        jest.clearAllMocks();
        subscriber = { next: jest.fn(), complete: jest.fn() };
        usageRecorder = { recordSafely: jest.fn() };
    });

    it('emits a chunk payload for a chunk event', () => {
        const sink = new TransientResultSink(
            subscriber as any,
            usageRecorder as unknown as RuntimeUsageRecorder,
            logger,
        );

        sink.emit({ type: 'chunk', text: 'Hello world' });

        expect(parseData(subscriber.next.mock.calls[0][0])).toEqual({ chunk: 'Hello world' });
    });

    it('sends done:true and completes on a successful end with no logCtx', () => {
        const sink = new TransientResultSink(
            subscriber as any,
            usageRecorder as unknown as RuntimeUsageRecorder,
            logger,
        );

        sink.onCompleted({ kind: 'end', fullText: 'Hello world' });

        expect(parseData(subscriber.next.mock.calls[0][0])).toEqual({ done: true });
        expect(subscriber.complete).toHaveBeenCalled();
        expect(usageRecorder.recordSafely).not.toHaveBeenCalled();
    });

    it('treats a stream that ends with no tokens as an error, without charging credits', () => {
        const sink = new TransientResultSink(
            subscriber as any,
            usageRecorder as unknown as RuntimeUsageRecorder,
            logger,
            fakeLogCtx,
        );

        sink.onCompleted({ kind: 'end', fullText: '' });

        expect(parseData(subscriber.next.mock.calls[0][0])).toEqual({
            error: "L'assistant n'a pas pu générer de réponse. Veuillez réessayer.",
        });
        expect(usageRecorder.recordSafely).toHaveBeenCalledWith(
            expect.objectContaining({ status: QueryLogStatus.ERROR }),
        );
    });

    it('reports an error event of the RAG engine as a generic error, billing the reported cost', () => {
        const sink = new TransientResultSink(
            subscriber as any,
            usageRecorder as unknown as RuntimeUsageRecorder,
            logger,
            fakeLogCtx,
        );

        sink.onCompleted({
            kind: 'end',
            fullText: 'Partial answer',
            streamError: 'upstream model timeout',
            costSummary: { total_cost_usd: 0.0004, by_model: { 'gpt-4o': 0.0004 }, by_type: { answer: 0.0004 } },
        });

        expect(parseData(subscriber.next.mock.calls[0][0])).toEqual({
            error: 'Une erreur est survenue. Veuillez réessayer.',
        });
        expect(subscriber.complete).toHaveBeenCalled();
        expect(usageRecorder.recordSafely).toHaveBeenCalledWith(
            expect.objectContaining({
                status: QueryLogStatus.ERROR,
                creditsUsed: 3,
                costByModel: { 'gpt-4o': 0.0004 },
                costByType: { answer: 0.0004 },
            }),
        );
        expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('does not record usage when no logCtx is passed (e.g. skipUsageTracking)', () => {
        const sink = new TransientResultSink(
            subscriber as any,
            usageRecorder as unknown as RuntimeUsageRecorder,
            logger,
        );

        sink.onCompleted({ kind: 'end', fullText: '' });

        expect(usageRecorder.recordSafely).not.toHaveBeenCalled();
    });

    it('deducts credits and records success on a successful end', () => {
        const sink = new TransientResultSink(
            subscriber as any,
            usageRecorder as unknown as RuntimeUsageRecorder,
            logger,
            fakeLogCtx,
        );

        sink.onCompleted({ kind: 'end', fullText: 'answer' });

        expect(usageRecorder.recordSafely).toHaveBeenCalledWith(
            expect.objectContaining({ workspaceId: 'ws-1', agentId: 'agent-1', status: QueryLogStatus.SUCCESS }),
        );
    });

    it('converts the RAG engine cost_summary into creditsUsed', () => {
        const sink = new TransientResultSink(
            subscriber as any,
            usageRecorder as unknown as RuntimeUsageRecorder,
            logger,
            fakeLogCtx,
        );

        sink.onCompleted({
            kind: 'end',
            fullText: 'answer',
            costSummary: { total_cost_usd: 0.014729510000000001 },
        });

        expect(usageRecorder.recordSafely).toHaveBeenCalledWith(expect.objectContaining({ creditsUsed: 111 }));
    });

    it('passes through the message of a recognized business error (HttpException)', () => {
        const sink = new TransientResultSink(
            subscriber as any,
            usageRecorder as unknown as RuntimeUsageRecorder,
            logger,
        );

        sink.onCompleted({ kind: 'error', error: new NotFoundException('Workflow not configured'), fullText: '' });

        expect(parseData(subscriber.next.mock.calls[0][0])).toEqual({ error: 'Workflow not configured' });
        expect(subscriber.complete).toHaveBeenCalled();
    });

    it('replaces a non-HttpException stream error with a generic message and reports it', () => {
        const sink = new TransientResultSink(
            subscriber as any,
            usageRecorder as unknown as RuntimeUsageRecorder,
            logger,
        );

        sink.onCompleted({ kind: 'error', error: new Error('socket hang up'), fullText: '' });

        expect(parseData(subscriber.next.mock.calls[0][0])).toEqual({
            error: 'Une erreur est survenue. Veuillez réessayer.',
        });
        expect(Sentry.captureException).toHaveBeenCalledWith(expect.objectContaining({ message: 'socket hang up' }));
    });
});
