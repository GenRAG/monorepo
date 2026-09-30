import type { MessageEvent } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import type { Subscriber } from 'rxjs';
import { QueryLogStatus } from 'generated/prisma';
import { costToCredits } from 'src/credit/credit-pricing';
import { toClientSafeErrorMessage } from 'src/agent-runtime/client-safe-error';
import { LogCtx } from 'src/agent-runtime/agent-runtime.types';
import { RuntimeUsageRecorder } from 'src/agent-runtime/usage/runtime-usage-recorder';
import { encodeSseEvent } from 'src/agent-runtime/streaming/runtime-sse-event';
import {
    BaseResultSink,
    StreamCompletionOutcome,
} from 'src/agent-runtime/streaming/sinks/runtime-result-sink.interface';

const EMPTY_ANSWER_MESSAGE = "L'assistant n'a pas pu générer de réponse. Veuillez réessayer.";

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

        const isEmptyAnswer = !outcome.streamError && !outcome.fullText;
        const clientMessage = outcome.streamError
            ? toClientSafeErrorMessage(new Error(outcome.streamError), 'RAG stream error', this.logger)
            : isEmptyAnswer
              ? EMPTY_ANSWER_MESSAGE
              : undefined;

        if (this.logCtx) {
            this.usageRecorder.recordSafely({
                workspaceId: this.logCtx.workspaceId,
                agentId: this.logCtx.agentId,
                query: this.logCtx.query.slice(0, 500),
                durationMs: Date.now() - this.logCtx.startedAt,
                status: clientMessage ? QueryLogStatus.ERROR : QueryLogStatus.SUCCESS,
                creditsUsed: outcome.costSummary ? costToCredits(outcome.costSummary.total_cost_usd) : undefined,
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
