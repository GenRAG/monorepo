import type { MessageEvent } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import type { Subscriber } from 'rxjs';
import { QueryLogStatus } from 'generated/prisma';
import { toClientSafeErrorMessage } from 'src/agent-runtime/client-safe-error';
import { LogCtx } from 'src/agent-runtime/agent-runtime.types';
import { RuntimeUsageRecorder } from 'src/agent-runtime/usage/runtime-usage-recorder';
import { encodeSseEvent } from 'src/agent-runtime/streaming/runtime-sse-event';
import {
    BaseResultSink,
    StreamCompletionOutcome,
} from 'src/agent-runtime/streaming/sinks/runtime-result-sink.interface';

export class TransientResultSink extends BaseResultSink {
    constructor(
        subscriber: Subscriber<MessageEvent>,
        private readonly usageRecorder: RuntimeUsageRecorder,
        private readonly logger: Logger,
        private readonly logCtx?: LogCtx,
    ) {
        super(subscriber);
    }

    onCompleted(outcome: StreamCompletionOutcome): void {
        if (outcome.kind === 'error') {
            if (this.logCtx) {
                this.usageRecorder.recordSafely({
                    workspaceId: this.logCtx.workspaceId,
                    agentId: this.logCtx.agentId,
                    query: this.logCtx.query.slice(0, 500),
                    durationMs: Date.now() - this.logCtx.startedAt,
                    status: QueryLogStatus.ERROR,
                });
            }
            const message = toClientSafeErrorMessage(outcome.error, 'RAG stream error', this.logger);
            this.subscriber.next(encodeSseEvent({ type: 'error', message }));
            this.subscriber.complete();
            return;
        }

        const clientMessage = this.endedStreamErrorMessage(outcome, this.logger);

        if (this.logCtx) {
            this.usageRecorder.recordSafely({
                workspaceId: this.logCtx.workspaceId,
                agentId: this.logCtx.agentId,
                query: this.logCtx.query.slice(0, 500),
                durationMs: Date.now() - this.logCtx.startedAt,
                status: clientMessage ? QueryLogStatus.ERROR : QueryLogStatus.SUCCESS,
                creditsUsed: this.creditsUsed(outcome),
                costByModel: outcome.costSummary?.by_model,
                costByType: outcome.costSummary?.by_type,
            });
        }

        this.subscriber.next(
            encodeSseEvent(clientMessage ? { type: 'error', message: clientMessage } : { type: 'done' }),
        );
        this.subscriber.complete();
    }
}
