import { Injectable, Logger } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { MessageSender, Prisma, QueryLogStatus } from 'generated/prisma';
import { Subscriber } from 'rxjs';
import * as Sentry from '@sentry/nestjs';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';
import { costToCredits } from 'src/credit/credit-pricing';
import {
    EventType,
    NdjsonLineBuffer,
    RagCitationCheck,
    RagCostSummary,
    RagSources,
} from 'src/rag-engine/ndjson-line-buffer';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { toClientSafeErrorMessage } from 'src/agent-runtime/client-safe-error';
import { LogCtx, RagStream } from 'src/agent-runtime/agent-runtime.types';

const EMPTY_ANSWER_MESSAGE = "L'assistant n'a pas pu générer de réponse. Veuillez réessayer.";

@Injectable()
export class RagStreamForwarderService {
    private readonly logger = new Logger(RagStreamForwarderService.name);

    constructor(
        private readonly usageTracker: UsageTrackerService,
        private readonly conversationRepo: ConversationRepository,
    ) {}

    forward(ragStream: RagStream, subscriber: Subscriber<MessageEvent>, logCtx?: LogCtx) {
        let fullText = '';
        const { getCostSummary, getStreamError } = this._consumeNdjsonStream(ragStream, subscriber, (text) => {
            fullText += text;
        });

        ragStream.on('end', () => {
            const streamError = getStreamError();
            const isEmptyAnswer = !streamError && !fullText;
            const clientMessage = streamError
                ? toClientSafeErrorMessage(new Error(streamError), 'RAG stream error', this.logger)
                : isEmptyAnswer
                  ? EMPTY_ANSWER_MESSAGE
                  : undefined;
            if (logCtx) {
                const costSummary = getCostSummary();
                void this.usageTracker
                    .recordQuery({
                        workspaceId: logCtx.workspaceId,
                        agentId: logCtx.agentId,
                        query: logCtx.query.slice(0, 500),
                        durationMs: Date.now() - logCtx.startedAt,
                        status: clientMessage ? QueryLogStatus.ERROR : QueryLogStatus.SUCCESS,
                        creditsUsed: costSummary ? costToCredits(costSummary.total_cost_usd) : undefined,
                        costByModel: costSummary?.by_model,
                        costByType: costSummary?.by_type,
                    })
                    .catch((e: Error) => {
                        this.logger.error(`Failed to record query: ${e.message}`);
                        Sentry.captureException(e);
                    });
            }
            subscriber.next({ data: JSON.stringify(clientMessage ? { error: clientMessage } : { done: true }) });
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
        const { getCostSummary, getStreamError, getCitedSources } = this._consumeNdjsonStream(
            ragStream,
            subscriber,
            (text) => {
                fullText += text;
            },
        );

        ragStream.on('end', () => {
            const costSummary = getCostSummary();
            const streamError = getStreamError();
            const citedSources = getCitedSources();
            const isEmptyAnswer = !streamError && !fullText;
            const errorMessage = streamError
                ? toClientSafeErrorMessage(new Error(streamError), 'RAG stream error', this.logger)
                : isEmptyAnswer
                  ? EMPTY_ANSWER_MESSAGE
                  : undefined;
            this._persistAndRecord({
                logCtx,
                convId,
                fullText,
                subscriber,
                status: errorMessage ? QueryLogStatus.ERROR : QueryLogStatus.SUCCESS,
                creditsUsed: costSummary ? costToCredits(costSummary.total_cost_usd) : undefined,
                costByModel: costSummary?.by_model,
                costByType: costSummary?.by_type,
                errorMessage,
                citedSources,
            });
        });

        ragStream.on('error', (err: Error) => {
            const costSummary = getCostSummary();
            this._persistAndRecord({
                logCtx,
                convId,
                fullText,
                subscriber,
                status: QueryLogStatus.ERROR,
                creditsUsed: costSummary ? costToCredits(costSummary.total_cost_usd) : undefined,
                costByModel: costSummary?.by_model,
                costByType: costSummary?.by_type,
                errorMessage: toClientSafeErrorMessage(err, 'RAG stream error', this.logger),
            });
        });
    }

    private _consumeNdjsonStream(
        ragStream: RagStream,
        subscriber: Subscriber<MessageEvent>,
        onToken?: (text: string) => void,
    ) {
        const lineBuffer = new NdjsonLineBuffer();
        const state: {
            costSummary?: RagCostSummary;
            // Full set of retrieved candidates, kept for a future debug mode — not used for persistence/display.
            sources?: RagSources[];
            citedSources?: RagSources[];
            streamError?: string;
            status?: string;
        } = {};

        const handlers: Record<EventType, (data: unknown) => void> = {
            [EventType.Token]: (data) => {
                const text = data as string;
                onToken?.(text);
                subscriber.next({ data: JSON.stringify({ chunk: text }) });
            },
            [EventType.CostSummary]: (data) => {
                state.costSummary = data as RagCostSummary;
            },
            [EventType.Error]: (data) => {
                state.streamError = typeof data === 'string' ? data : 'RAG engine error';
            },
            [EventType.Sources]: (data) => {
                const sources = data as RagSources[];
                state.sources = sources;
                subscriber.next({ data: JSON.stringify({ sources }) });
            },
            [EventType.CitationCheck]: (data) => {
                const citationCheck = data as RagCitationCheck;
                if (citationCheck.cited_sources) {
                    state.citedSources = citationCheck.cited_sources;
                    subscriber.next({ data: JSON.stringify({ citedSources: citationCheck.cited_sources }) });
                }
            },
            [EventType.Status]: (data) => {
                if (typeof data === 'string') {
                    subscriber.next({ data: JSON.stringify({ status: data }) });
                }
            },
        };

        ragStream.on('data', (chunk: Buffer) => {
            for (const event of lineBuffer.push(chunk.toString('utf-8'))) {
                handlers[event.type]?.(event.data);
            }
        });

        return {
            getCostSummary: () => state.costSummary,
            getStreamError: () => state.streamError,
            getSources: () => state.sources,
            getCitedSources: () => state.citedSources,
        };
    }

    private _persistAndRecord({
        logCtx,
        convId,
        fullText,
        subscriber,
        status,
        creditsUsed,
        costByModel,
        costByType,
        errorMessage,
        citedSources,
    }: {
        logCtx: LogCtx;
        convId: string;
        fullText: string;
        subscriber: Subscriber<MessageEvent>;
        status: QueryLogStatus;
        creditsUsed?: number;
        costByModel?: Record<string, number>;
        costByType?: Record<string, number>;
        errorMessage?: string;
        citedSources?: RagSources[];
    }) {
        const durationMs = Date.now() - logCtx.startedAt;

        void this.usageTracker
            .recordQuery({
                workspaceId: logCtx.workspaceId,
                agentId: logCtx.agentId,
                query: logCtx.query.slice(0, 500),
                durationMs,
                status,
                creditsUsed,
                costByModel,
                costByType,
            })
            .catch((e: Error) => {
                this.logger.error(`Failed to record query: ${e.message}`);
                Sentry.captureException(e);
            });

        const content = fullText || errorMessage || '';

        const metadata: Record<string, unknown> = { durationMs };
        if (citedSources?.length) metadata.sources = citedSources;

        void this.conversationRepo
            .createMessage({
                conversationId: convId,
                sender: MessageSender.AGENT,
                content,
                metadata: metadata as unknown as Prisma.InputJsonValue,
            })
            .then(() => (status === QueryLogStatus.SUCCESS ? this.conversationRepo.updateTimestamp(convId) : undefined))
            .catch((e: Error) => {
                this.logger.error(`Failed to persist message for conv ${convId}: ${e.message}`);
                Sentry.captureException(e);
            })
            .finally(() => {
                const payload = errorMessage
                    ? { error: errorMessage }
                    : { done: true, conversationId: convId, durationMs };
                subscriber.next({ data: JSON.stringify(payload) });
                subscriber.complete();
            });
    }
}
