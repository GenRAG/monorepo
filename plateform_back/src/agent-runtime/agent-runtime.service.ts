import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import type { IncomingMessage } from 'http';
import { AgentStatus, MessageSender, QueryLogStatus } from 'generated/prisma';
import { Observable, Subscriber } from 'rxjs';
import * as Sentry from '@sentry/nestjs';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';
import { PrismaService } from 'src/prisma/prisma.service';

type RagStream = IncomingMessage;
type StartRagResult = { ok: true; stream: RagStream } | { ok: false; isOutOfCredits: boolean; error: string };

interface StreamOptions {
    orgIdOverride?: string;
    skipUsageTracking?: boolean;
    forceActiveWorkflow?: boolean;
}

interface LogCtx {
    workspaceId: string;
    agentId: string;
    query: string;
    startedAt: number;
}

@Injectable()
export class AgentRuntimeService {
    private readonly logger = new Logger(AgentRuntimeService.name);

    constructor(
        private readonly orchestrator: AgentRuntimeOrchestrator,
        private readonly prisma: PrismaService,
        private readonly usageTracker: UsageTrackerService,
    ) {}

    playgroundStream(workspaceId: string, agentId: string, query: string): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            void this._dispatchStream(subscriber, workspaceId, agentId, query, { forceActiveWorkflow: true });
        });
    }

    streamWithOrgOverride(
        workspaceId: string,
        agentId: string,
        query: string,
        orgIdOverride: string,
    ): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            void this._dispatchStream(subscriber, workspaceId, agentId, query, {
                orgIdOverride,
                skipUsageTracking: true,
            });
        });
    }

    streamWithPersistence(
        agentId: string,
        query: string,
        conversationId?: string,
        userId?: string,
    ): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            void this._dispatchStreamWithPersistence(subscriber, agentId, query, conversationId, userId);
        });
    }

    private async _dispatchStream(
        subscriber: Subscriber<MessageEvent>,
        workspaceId: string,
        agentId: string,
        query: string,
        options: StreamOptions = {},
    ) {
        const startedAt = Date.now();
        const result = await this._startRagStream(workspaceId, agentId, query, options);
        if (!result.ok) {
            subscriber.next({ data: JSON.stringify({ error: result.error, isOutOfCredits: result.isOutOfCredits }) });
            subscriber.complete();
            if (!options.skipUsageTracking) {
                void this.usageTracker
                    .recordQuery({
                        workspaceId,
                        agentId,
                        query: query.slice(0, 500),
                        durationMs: Date.now() - startedAt,
                        status: result.isOutOfCredits ? QueryLogStatus.OUT_OF_CREDITS : QueryLogStatus.ERROR,
                    })
                    .catch((e: Error) => {
                        this.logger.error(`Failed to log query: ${e.message}`);
                        Sentry.captureException(e);
                    });
            }
            return;
        }
        if (!options.skipUsageTracking) {
            this._forwardStream(result.stream, subscriber, { workspaceId, agentId, query, startedAt });
        } else {
            this._forwardStream(result.stream, subscriber);
        }
    }

    private async _dispatchStreamWithPersistence(
        subscriber: Subscriber<MessageEvent>,
        agentId: string,
        query: string,
        conversationId?: string,
        userId?: string,
    ) {
        const startedAt = Date.now();
        const workspaceId = await this._resolveWorkspaceId(agentId, subscriber);
        if (!workspaceId) return;

        const result = await this._startRagStream(workspaceId, agentId, query);
        if (!result.ok) {
            subscriber.next({ data: JSON.stringify({ error: result.error, isOutOfCredits: result.isOutOfCredits }) });
            subscriber.complete();
            return;
        }
        const ragStream = result.stream;

        const convId = await this._initConversation(subscriber, workspaceId, agentId, query, conversationId, userId);
        if (!convId) {
            ragStream.destroy();
            return;
        }

        this._forwardStreamWithPersistence(ragStream, convId, subscriber, {
            workspaceId,
            agentId,
            query,
            startedAt,
        });
    }

    private async _resolveWorkspaceId(agentId: string, subscriber: Subscriber<MessageEvent>): Promise<string | null> {
        const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
        if (!agent) {
            subscriber.next({ data: JSON.stringify({ error: 'Assistant not found' }) });
            subscriber.complete();
            return null;
        }
        if (agent.status !== AgentStatus.PRODUCTION) {
            subscriber.next({ data: JSON.stringify({ error: 'Assistant not available' }) });
            subscriber.complete();
            return null;
        }
        return agent.workspaceId;
    }

    private async _startRagStream(
        workspaceId: string,
        agentId: string,
        query: string,
        { orgIdOverride, skipUsageTracking = false, forceActiveWorkflow = false }: StreamOptions = {},
    ): Promise<StartRagResult> {
        try {
            const stream = await this.orchestrator.streamQuery({
                query,
                agentId,
                workspaceId,
                orgIdOverride,
                skipUsageTracking,
                forceActiveWorkflow,
            });
            return { ok: true, stream };
        } catch (err: unknown) {
            const isOutOfCredits = err instanceof ForbiddenException;
            if (!isOutOfCredits) {
                this.logger.error(`RAG stream error: ${err instanceof Error ? err.message : String(err)}`);
                Sentry.captureException(err);
            }
            return {
                ok: false,
                isOutOfCredits,
                error: isOutOfCredits
                    ? 'Pas de crédits disponibles.'
                    : err instanceof Error
                      ? err.message
                      : 'Unknown error',
            };
        }
    }

    private async _initConversation(
        subscriber: Subscriber<MessageEvent>,
        workspaceId: string,
        agentId: string,
        query: string,
        conversationId?: string,
        userId?: string,
    ): Promise<string | null> {
        try {
            let convId: string;

            if (conversationId) {
                const existing = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
                if (!existing || existing.agentId !== agentId) {
                    subscriber.next({ data: JSON.stringify({ error: 'Conversation not found' }) });
                    subscriber.complete();
                    return null;
                }
                convId = conversationId;
            } else {
                convId = (
                    await this.prisma.conversation.create({
                        data: { agentId, workspaceId, title: query.slice(0, 60), userId },
                    })
                ).id;
            }

            await this.prisma.message.create({
                data: { conversationId: convId, sender: MessageSender.USER, content: query },
            });

            return convId;
        } catch (err: unknown) {
            subscriber.next({
                data: JSON.stringify({
                    error: err instanceof Error ? err.message : 'Failed to initialize conversation',
                }),
            });
            subscriber.complete();
            return null;
        }
    }

    private _forwardStream(ragStream: RagStream, subscriber: Subscriber<MessageEvent>, logCtx?: LogCtx) {
        ragStream.on('data', (chunk: Buffer) => {
            subscriber.next({ data: JSON.stringify({ chunk: chunk.toString('utf-8') }) });
        });
        ragStream.on('end', () => {
            if (logCtx) {
                void this.usageTracker
                    .recordQuery({
                        workspaceId: logCtx.workspaceId,
                        agentId: logCtx.agentId,
                        query: logCtx.query.slice(0, 500),
                        durationMs: Date.now() - logCtx.startedAt,
                        status: QueryLogStatus.SUCCESS,
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
            subscriber.next({ data: JSON.stringify({ error: err.message }) });
            subscriber.complete();
        });
    }

    private _forwardStreamWithPersistence(
        ragStream: RagStream,
        convId: string,
        subscriber: Subscriber<MessageEvent>,
        logCtx: LogCtx,
    ) {
        let fullText = '';

        ragStream.on('data', (chunk: Buffer) => {
            const text = chunk.toString('utf-8');
            fullText += text;
            subscriber.next({ data: JSON.stringify({ chunk: text }) });
        });

        ragStream.on('end', () => {
            void this.usageTracker
                .recordQuery({
                    workspaceId: logCtx.workspaceId,
                    agentId: logCtx.agentId,
                    query: logCtx.query.slice(0, 500),
                    durationMs: Date.now() - logCtx.startedAt,
                    status: QueryLogStatus.SUCCESS,
                })
                .catch((e: Error) => {
                    this.logger.error(`Failed to record query: ${e.message}`);
                    Sentry.captureException(e);
                });

            void this.prisma.message
                .create({
                    data: { conversationId: convId, sender: MessageSender.AGENT, content: fullText },
                })
                .then(() =>
                    this.prisma.conversation.update({
                        where: { id: convId },
                        data: { updatedAt: new Date() },
                    }),
                )
                .catch((e: Error) => {
                    this.logger.error(`Failed to persist agent message for conv ${convId}: ${e.message}`);
                    Sentry.captureException(e);
                })
                .finally(() => {
                    subscriber.next({ data: JSON.stringify({ done: true, conversationId: convId }) });
                    subscriber.complete();
                });
        });

        ragStream.on('error', (err: Error) => {
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

            void this.prisma.message
                .create({
                    data: {
                        conversationId: convId,
                        sender: MessageSender.AGENT,
                        content: fullText || err.message,
                    },
                })
                .catch((e: Error) => {
                    this.logger.error(`Failed to persist error message for conv ${convId}: ${e.message}`);
                    Sentry.captureException(e);
                })
                .finally(() => {
                    subscriber.next({ data: JSON.stringify({ error: err.message }) });
                    subscriber.complete();
                });
        });
    }
}
