import { jest, describe, it, expect } from '@jest/globals';
import { QueryLogStatus } from 'generated/prisma';
import * as Sentry from '@sentry/nestjs';
import { Job } from 'bullmq';
import { UsageRecordingProcessor } from 'src/agent-runtime/usage/usage-recording.processor';
import { RECORD_QUERY_JOB, RecordQueryParams } from 'src/agent-runtime/usage/runtime-usage-recorder';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';

jest.mock('@sentry/nestjs');

function createJob(overrides: Partial<Job<RecordQueryParams>> = {}): Job<RecordQueryParams> {
    return {
        id: 'job-1',
        name: RECORD_QUERY_JOB,
        data: {
            workspaceId: 'ws-1',
            agentId: 'agent-1',
            query: 'hello',
            durationMs: 10,
            status: QueryLogStatus.SUCCESS,
        },
        attemptsMade: 0,
        opts: { attempts: 5 },
        ...overrides,
    } as Job<RecordQueryParams>;
}

describe('UsageRecordingProcessor', () => {
    it('delegates to UsageTrackerService.recordQuery', async () => {
        const usageTracker = { recordQuery: jest.fn<any>().mockResolvedValue(undefined) };
        const processor = new UsageRecordingProcessor(usageTracker as unknown as UsageTrackerService);
        const job = createJob();

        await processor.process(job);

        expect(usageTracker.recordQuery).toHaveBeenCalledWith(job.data);
    });

    it('ignores jobs of another name on the same queue', async () => {
        const usageTracker = { recordQuery: jest.fn<any>().mockResolvedValue(undefined) };
        const processor = new UsageRecordingProcessor(usageTracker as unknown as UsageTrackerService);
        const job = createJob({ name: 'something-else' });

        await processor.process(job);

        expect(usageTracker.recordQuery).not.toHaveBeenCalled();
    });

    it('rethrows on failure so BullMQ retries, without reporting to Sentry before the last attempt', async () => {
        const err = new Error('DB down');
        const usageTracker = { recordQuery: jest.fn<any>().mockRejectedValue(err) };
        const processor = new UsageRecordingProcessor(usageTracker as unknown as UsageTrackerService);
        const job = createJob({ attemptsMade: 1, opts: { attempts: 5 } });

        await expect(processor.process(job)).rejects.toThrow(err);
        expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('reports to Sentry once the last attempt fails', async () => {
        const err = new Error('DB down');
        const usageTracker = { recordQuery: jest.fn<any>().mockRejectedValue(err) };
        const processor = new UsageRecordingProcessor(usageTracker as unknown as UsageTrackerService);
        const job = createJob({ attemptsMade: 4, opts: { attempts: 5 } });

        await expect(processor.process(job)).rejects.toThrow(err);
        expect(Sentry.captureException).toHaveBeenCalledWith(err);
    });
});
