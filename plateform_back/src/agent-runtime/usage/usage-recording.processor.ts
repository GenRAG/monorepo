import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as Sentry from '@sentry/nestjs';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';
import {
    RECORD_QUERY_JOB,
    RecordQueryParams,
    USAGE_RECORDING_QUEUE,
} from 'src/agent-runtime/usage/runtime-usage-recorder';

@Injectable()
@Processor(USAGE_RECORDING_QUEUE, { concurrency: 5 })
export class UsageRecordingProcessor extends WorkerHost {
    private readonly logger = new Logger(UsageRecordingProcessor.name);

    constructor(private readonly usageTracker: UsageTrackerService) {
        super();
    }

    async process(job: Job<RecordQueryParams>): Promise<void> {
        if (job.name !== RECORD_QUERY_JOB) return;

        try {
            await this.usageTracker.recordQuery(job.data);
        } catch (error) {
            const attemptNumber = job.attemptsMade + 1;
            const maxAttempts = job.opts.attempts ?? 1;

            this.logger.error(
                `Job ${job.id} failed to record query usage for agent ${job.data.agentId} (${attemptNumber}/${maxAttempts})`,
                error instanceof Error ? error.stack : undefined,
            );

            if (attemptNumber >= maxAttempts) {
                Sentry.captureException(error);
            }

            throw error;
        }
    }
}
