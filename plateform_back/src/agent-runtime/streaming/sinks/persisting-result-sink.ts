import type { MessageEvent } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import type { Subscriber } from 'rxjs';
import { MessageSender, Prisma, QueryLogStatus } from 'generated/prisma';
import * as Sentry from '@sentry/nestjs';
import { RagSources } from 'src/rag-engine/ndjson-line-buffer';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { toClientSafeErrorMessage } from 'src/agent-runtime/client-safe-error';
import { LogCtx } from 'src/agent-runtime/agent-runtime.types';
import { RuntimeUsageRecorder } from 'src/agent-runtime/usage/runtime-usage-recorder';
import { RuntimeSseEvent, encodeSseEvent } from 'src/agent-runtime/streaming/runtime-sse-event';
import {
    BaseResultSink,
    StreamCompletionOutcome,
} from 'src/agent-runtime/streaming/sinks/runtime-result-sink.interface';

interface PersistParams {
    fullText: string;
    status: QueryLogStatus;
    durationMs: number;
    creditsUsed?: number;
    costByModel?: Record<string, number>;
    costByType?: Record<string, number>;
    errorMessage?: string;
    citedSources?: RagSources[];
}

export class PersistingResultSink extends BaseResultSink {
    constructor(
        subscriber: Subscriber<MessageEvent>,
        private readonly convId: string,
        private readonly logCtx: LogCtx,
        private readonly usageRecorder: RuntimeUsageRecorder,
        private readonly conversationRepo: ConversationRepository,
        private readonly logger: Logger,
    ) {
        super(subscriber);
    }

    async onCompleted(outcome: StreamCompletionOutcome): Promise<void> {
        const durationMs = Date.now() - this.logCtx.startedAt;
        const creditsUsed = this.creditsUsed(outcome);

        if (outcome.kind === 'error') {
            await this._persistAndRecord({
                fullText: outcome.fullText,
                status: QueryLogStatus.ERROR,
                durationMs,
                creditsUsed,
                costByModel: outcome.costSummary?.by_model,
                costByType: outcome.costSummary?.by_type,
                errorMessage: toClientSafeErrorMessage(outcome.error, 'RAG stream error', this.logger),
            });
            return;
        }

        const errorMessage = this.endedStreamErrorMessage(outcome, this.logger);

        await this._persistAndRecord({
            fullText: outcome.fullText,
            status: errorMessage ? QueryLogStatus.ERROR : QueryLogStatus.SUCCESS,
            durationMs,
            creditsUsed,
            costByModel: outcome.costSummary?.by_model,
            costByType: outcome.costSummary?.by_type,
            errorMessage,
            citedSources: outcome.citedSources,
        });
    }

    private async _persistAndRecord(params: PersistParams): Promise<void> {
        this.usageRecorder.recordSafely({
            workspaceId: this.logCtx.workspaceId,
            agentId: this.logCtx.agentId,
            query: this.logCtx.query.slice(0, 500),
            durationMs: params.durationMs,
            status: params.status,
            creditsUsed: params.creditsUsed,
            costByModel: params.costByModel,
            costByType: params.costByType,
        });

        const content = params.fullText || params.errorMessage || '';
        const metadata: Record<string, unknown> = { durationMs: params.durationMs };
        if (params.citedSources?.length) metadata.sources = params.citedSources;

        try {
            await this.conversationRepo.createMessage({
                conversationId: this.convId,
                sender: MessageSender.AGENT,
                content,
                metadata: metadata as unknown as Prisma.InputJsonValue,
            });
            if (params.status === QueryLogStatus.SUCCESS) {
                await this.conversationRepo.updateTimestamp(this.convId);
            }
        } catch (e) {
            this.logger.error(`Failed to persist message for conv ${this.convId}: ${(e as Error).message}`);
            Sentry.captureException(e);
        } finally {
            const payload: RuntimeSseEvent = params.errorMessage
                ? { type: 'error', message: params.errorMessage }
                : { type: 'done', conversationId: this.convId, durationMs: params.durationMs };
            this.subscriber.next(encodeSseEvent(payload));
            this.subscriber.complete();
        }
    }
}
