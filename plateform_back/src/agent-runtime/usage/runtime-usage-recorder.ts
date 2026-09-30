import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as Sentry from '@sentry/nestjs';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';

export type RecordQueryParams = Parameters<UsageTrackerService['recordQuery']>[0];

export const USAGE_RECORDING_QUEUE = 'usage-recording';
export const RECORD_QUERY_JOB = 'record-query';

@Injectable()
export class RuntimeUsageRecorder {
    private readonly logger = new Logger(RuntimeUsageRecorder.name);

    constructor(@InjectQueue(USAGE_RECORDING_QUEUE) private readonly usageQueue: Queue<RecordQueryParams>) {}

    recordSafely(params: RecordQueryParams): void {
        void this.usageQueue
            .add(RECORD_QUERY_JOB, params, {
                attempts: 5,
                backoff: { type: 'exponential', delay: 3000 },
                removeOnComplete: true,
                removeOnFail: false,
            })
            .catch((e: Error) => {
                this.logger.error(`Failed to enqueue query usage recording: ${e.message}`);
                Sentry.captureException(e);
            });
    }
}
