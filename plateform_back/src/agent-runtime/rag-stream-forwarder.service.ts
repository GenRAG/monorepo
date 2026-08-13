import { Injectable, Logger } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { MessageSender, QueryLogStatus } from 'generated/prisma';
import { Subscriber } from 'rxjs';
import * as Sentry from '@sentry/nestjs';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';
import { costToCredits } from 'src/credit/credit-pricing';
import { NdjsonLineBuffer, RagCostSummary } from 'src/rag-engine/ndjson-line-buffer';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { toClientSafeErrorMessage } from 'src/agent-runtime/client-safe-error';
import { LogCtx, RagStream } from 'src/agent-runtime/agent-runtime.types';

@Injectable()
export class RagStreamForwarderService {
    private readonly logger = new Logger(RagStreamForwarderService.name);

    constructor(
        private readonly usageTracker: UsageTrackerService,
        private readonly conversationRepo: ConversationRepository,
    ) {}

    forward(ragStream: RagStream, subscriber: Subscriber<MessageEvent>, logCtx?: LogCtx) {
        const { getCostSummary } = this._consumeNdjsonStream(ragStream, subscriber);

        ragStream.on('end', () => {
            if (logCtx) {
                const costSummary = getCostSummary();
                void this.usageTracker
                    .recordQuery({
                        workspaceId: logCtx.workspaceId,
                        agentId: logCtx.agentId,
                        query: logCtx.query.slice(0, 500),
                        durationMs: Date.now() - logCtx.startedAt,
                        status: QueryLogStatus.SUCCESS,
                        creditsUsed: costSummary ? costToCredits(costSummary.total_cost_usd) : undefined,
                    })
                    .catch((e: Error) => {
                        this.logger.error(`Failed to record query: ${e.message}`);
                        Sentry.captureException(e);
                    });
            }
            subscriber.next({ data: JSON.stringify({ done: true }) });
            subscriber.complete();
        });
        ragStream.on('error', (err: Error) => {
            if (logCtx) {
                void this.usageTracker
                    .recordQuery({
                        workspaceId: logCtx.workspaceId,
                        agentId: logCtx.agentId,
                        query: logCtx.query.slice(0, 500),
                        durationMs: Date.now() - logCtx.startedAt,
                        status: QueryLogStatus.ERROR,
                    })
                    .catch((e: Error) => {
                        this.logger.error(`Failed to record query error: ${e.message}`);
                        Sentry.captureException(e);
                    });
            }
            const message = toClientSafeErrorMessage(err, 'RAG stream error', this.logger);
            subscriber.next({ data: JSON.stringify({ error: message }) });
            subscriber.complete();
        });
    }

    forwardWithPersistence(ragStream: RagStream, convId: string, subscriber: Subscriber<MessageEvent>, logCtx: LogCtx) {
        let fullText = '';
        const { getCostSummary } = this._consumeNdjsonStream(ragStream, subscriber, (text) => {
            fullText += text;
        });

        ragStream.on('end', () => {
            const costSummary = getCostSummary();
            this._persistAndRecord(
                logCtx,
                convId,
                fullText,
                subscriber,
                QueryLogStatus.SUCCESS,
                costSummary ? costToCredits(costSummary.total_cost_usd) : undefined,
            );
        });

        ragStream.on('error', (err: Error) => {
            const costSummary = getCostSummary();
            this._persistAndRecord(
                logCtx,
                convId,
                fullText,
                subscriber,
                QueryLogStatus.ERROR,
                costSummary ? costToCredits(costSummary.total_cost_usd) : undefined,
                toClientSafeErrorMessage(err, 'RAG stream error', this.logger),
            );
        });
    }

    private _consumeNdjsonStream(
        ragStream: RagStream,
        subscriber: Subscriber<MessageEvent>,
        onToken?: (text: string) => void,
    ): { getCostSummary: () => RagCostSummary | undefined } {
        const lineBuffer = new NdjsonLineBuffer();
        let costSummary: RagCostSummary | undefined;

        ragStream.on('data', (chunk: Buffer) => {
            for (const event of lineBuffer.push(chunk.toString('utf-8'))) {
                if (event.type === 'token') {
                    const text = event.data as string;
                    onToken?.(text);
                    subscriber.next({ data: JSON.stringify({ chunk: text }) });
                } else if (event.type === 'cost_summary') {
                    costSummary = event.data as RagCostSummary;
                }
            }
        });

        return { getCostSummary: () => costSummary };
    }

    private _persistAndRecord(
        logCtx: LogCtx,
        convId: string,
        fullText: string,
        subscriber: Subscriber<MessageEvent>,
        status: QueryLogStatus,
        creditsUsed?: number,
        errorMessage?: string,
    ) {
        void this.usageTracker
            .recordQuery({
                workspaceId: logCtx.workspaceId,
                agentId: logCtx.agentId,
                query: logCtx.query.slice(0, 500),
                durationMs: Date.now() - logCtx.startedAt,
                status,
                creditsUsed,
            })
            .catch((e: Error) => {
                this.logger.error(`Failed to record query: ${e.message}`);
                Sentry.captureException(e);
            });

        const content = fullText || errorMessage || '';

        void this.conversationRepo
            .createMessage({ conversationId: convId, sender: MessageSender.AGENT, content })
            .then(() => (status === QueryLogStatus.SUCCESS ? this.conversationRepo.updateTimestamp(convId) : undefined))
            .catch((e: Error) => {
                this.logger.error(`Failed to persist message for conv ${convId}: ${e.message}`);
                Sentry.captureException(e);
            })
            .finally(() => {
                const payload = errorMessage ? { error: errorMessage } : { done: true, conversationId: convId };
                subscriber.next({ data: JSON.stringify(payload) });
                subscriber.complete();
            });
    }
}
