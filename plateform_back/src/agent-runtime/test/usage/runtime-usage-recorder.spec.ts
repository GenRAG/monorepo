import { jest, describe, it, expect } from '@jest/globals';
import { QueryLogStatus } from 'generated/prisma';
import * as Sentry from '@sentry/nestjs';
import { Queue } from 'bullmq';
import {
    RECORD_QUERY_JOB,
    RecordQueryParams,
    RuntimeUsageRecorder,
} from 'src/agent-runtime/usage/runtime-usage-recorder';

jest.mock('@sentry/nestjs');

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('RuntimeUsageRecorder', () => {
    it('enqueues a record-query job with retry/backoff options', () => {
        const queue = { add: jest.fn<any>().mockResolvedValue(undefined) };
        const recorder = new RuntimeUsageRecorder(queue as unknown as Queue<RecordQueryParams>);
        const params = {
            workspaceId: 'ws-1',
            agentId: 'agent-1',
            query: 'hello',
            durationMs: 10,
            status: QueryLogStatus.SUCCESS,
        };

        recorder.recordSafely(params);

        expect(queue.add).toHaveBeenCalledWith(
            RECORD_QUERY_JOB,
            params,
            expect.objectContaining({ attempts: 5, backoff: { type: 'exponential', delay: 3000 } }),
        );
    });

    it('logs and reports to Sentry instead of throwing when enqueueing rejects', async () => {
        const err = new Error('Redis down');
        const queue = { add: jest.fn<any>().mockRejectedValue(err) };
        const recorder = new RuntimeUsageRecorder(queue as unknown as Queue<RecordQueryParams>);

        expect(() =>
            recorder.recordSafely({
                workspaceId: 'ws-1',
                agentId: 'agent-1',
                query: 'hello',
                durationMs: 10,
                status: QueryLogStatus.ERROR,
            }),
        ).not.toThrow();

        await flushPromises();

        expect(Sentry.captureException).toHaveBeenCalledWith(err);
    });
});
