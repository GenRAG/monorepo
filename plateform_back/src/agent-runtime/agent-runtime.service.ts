import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { AgentStatus, MessageSender, QueryLogStatus } from 'generated/prisma';
import { Observable, Subscriber } from 'rxjs';
import * as Sentry from '@sentry/nestjs';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { RagStreamForwarderService } from 'src/agent-runtime/rag-stream-forwarder.service';
import { toClientSafeErrorMessage } from 'src/agent-runtime/client-safe-error';
import { RagStream } from 'src/agent-runtime/agent-runtime.types';

type StartRagResult = { ok: true; stream: RagStream } | { ok: false; isOutOfCredits: boolean; error: string };

type StreamRef = { current: RagStream | null };

interface StreamOptions {
    orgIdOverride?: string;
    skipUsageTracking?: boolean;
    forceActiveWorkflow?: boolean;
}

@Injectable()
export class AgentRuntimeService {
    private readonly logger = new Logger(AgentRuntimeService.name);

    constructor(
        private readonly orchestrator: AgentRuntimeOrchestrator,
        private readonly prisma: PrismaService,
        private readonly usageTracker: UsageTrackerService,
        private readonly conversationRepo: ConversationRepository,
        private readonly streamForwarder: RagStreamForwarderService,
    ) {}

    playgroundStream(workspaceId: string, agentId: string, query: string): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            const streamRef: StreamRef = { current: null };
            void this._dispatchStream(
                subscriber,
                workspaceId,
                agentId,
                query,
                { forceActiveWorkflow: true },
                streamRef,
            );
            return () => this._teardownStream(streamRef);
        });
    }

    streamWithOrgOverride(
        workspaceId: string,
        agentId: string,
        query: string,
        orgIdOverride: string,
    ): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            const streamRef: StreamRef = { current: null };
            void this._dispatchStream(subscriber, workspaceId, agentId, query, { orgIdOverride }, streamRef);
            return () => this._teardownStream(streamRef);
        });
    }

    streamWithPersistence(
        agentId: string,
        query: string,
        conversationId?: string,
        userId?: string,
    ): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            const streamRef: StreamRef = { current: null };
            void this._dispatchStreamWithPersistence(subscriber, agentId, query, conversationId, userId, streamRef);
            return () => this._teardownStream(streamRef);
        });
    }

    private _teardownStream(ref: StreamRef): void {
        const stream = ref.current;
        if (stream && !stream.destroyed) {
            stream.destroy();
        }
    }

    private async _dispatchStream(
        subscriber: Subscriber<MessageEvent>,
        workspaceId: string,
        agentId: string,
        query: string,
        options: StreamOptions = {},
        streamRef: StreamRef,
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
        streamRef.current = result.stream;
        if (!options.skipUsageTracking) {
            this.streamForwarder.forward(result.stream, subscriber, { workspaceId, agentId, query, startedAt });
        } else {
            this.streamForwarder.forward(result.stream, subscriber);
        }
    }

    private async _dispatchStreamWithPersistence(
        subscriber: Subscriber<MessageEvent>,
        agentId: string,
        query: string,
        conversationId: string | undefined,
        userId: string | undefined,
        streamRef: StreamRef,
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
        streamRef.current = ragStream;

        const convId = await this._initConversation(subscriber, workspaceId, agentId, query, conversationId, userId);
        if (!convId) {
            ragStream.destroy();
            return;
        }

        this.streamForwarder.forwardWithPersistence(ragStream, convId, subscriber, {
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
            return {
                ok: false,
                isOutOfCredits,
                error: isOutOfCredits
                    ? 'Insufficient credits.'
                    : toClientSafeErrorMessage(err, 'RAG stream error', this.logger),
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
            if (conversationId) {
                const existing = await this.conversationRepo.findOne(conversationId);
                if (!existing || existing.agentId !== agentId) {
                    subscriber.next({ data: JSON.stringify({ error: 'Conversation not found' }) });
                    subscriber.complete();
                    return null;
                }
            }

            return await this.conversationRepo.transaction(async (tx) => {
                const convId = conversationId
                    ? conversationId
                    : (
                          await this.conversationRepo.create(
                              { agentId, workspaceId, title: query.slice(0, 60), userId },
                              tx,
                          )
                      ).id;

                await this.conversationRepo.createMessage(
                    { conversationId: convId, sender: MessageSender.USER, content: query },
                    tx,
                );

                return convId;
            });
        } catch (err: unknown) {
            const message = toClientSafeErrorMessage(err, 'Failed to initialize conversation', this.logger);
            subscriber.next({ data: JSON.stringify({ error: message }) });
            subscriber.complete();
            return null;
        }
    }
}
