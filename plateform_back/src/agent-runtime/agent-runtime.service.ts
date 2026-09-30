import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { AgentStatus, MessageSender, QueryLogStatus } from 'generated/prisma';
import { Observable, Subscriber } from 'rxjs';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { RagStreamForwarderService } from 'src/agent-runtime/streaming/rag-stream-forwarder.service';
import { RuntimeSinkFactory } from 'src/agent-runtime/streaming/sinks/runtime-sink.factory';
import { RuntimeUsageRecorder } from 'src/agent-runtime/usage/runtime-usage-recorder';
import { toClientSafeErrorMessage } from 'src/agent-runtime/client-safe-error';
import { encodeSseEvent } from 'src/agent-runtime/streaming/runtime-sse-event';
import { LogCtx, RagStream } from 'src/agent-runtime/agent-runtime.types';

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
        private readonly conversationRepo: ConversationRepository,
        private readonly streamForwarder: RagStreamForwarderService,
        private readonly sinkFactory: RuntimeSinkFactory,
        private readonly usageRecorder: RuntimeUsageRecorder,
    ) {}

    playgroundStream(workspaceId: string, agentId: string, query: string): Observable<MessageEvent> {
        return this._observe((subscriber, streamRef) =>
            this._runTransientStream(subscriber, streamRef, workspaceId, agentId, query, {
                forceActiveWorkflow: true,
            }),
        );
    }

    streamWithOrgOverride(
        workspaceId: string,
        agentId: string,
        query: string,
        orgIdOverride: string,
    ): Observable<MessageEvent> {
        return this._observe((subscriber, streamRef) =>
            this._runTransientStream(subscriber, streamRef, workspaceId, agentId, query, { orgIdOverride }),
        );
    }

    streamWithPersistence(
        agentId: string,
        query: string,
        conversationId?: string,
        userId?: string,
    ): Observable<MessageEvent> {
        return this._observe((subscriber, streamRef) =>
            this._runPersistedStream(subscriber, streamRef, agentId, query, conversationId, userId),
        );
    }

    private _observe(
        run: (subscriber: Subscriber<MessageEvent>, streamRef: StreamRef) => Promise<void>,
    ): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            const streamRef: StreamRef = { current: null };
            void run(subscriber, streamRef);
            return () => this._teardownStream(streamRef);
        });
    }

    private _teardownStream(ref: StreamRef): void {
        const stream = ref.current;
        if (stream && !stream.destroyed) {
            stream.destroy();
        }
    }

    private async _runTransientStream(
        subscriber: Subscriber<MessageEvent>,
        streamRef: StreamRef,
        workspaceId: string,
        agentId: string,
        query: string,
        streamOptions: StreamOptions,
    ): Promise<void> {
        const startedAt = Date.now();
        const stream = await this._startOrFail(
            subscriber,
            workspaceId,
            agentId,
            query,
            streamOptions,
            startedAt,
            !streamOptions.skipUsageTracking,
        );
        if (!stream) return;

        streamRef.current = stream;
        const logCtx: LogCtx | undefined = streamOptions.skipUsageTracking
            ? undefined
            : { workspaceId, agentId, query, startedAt };

        this.streamForwarder.forward(stream, this.sinkFactory.createTransient(subscriber, logCtx));
    }

    private async _runPersistedStream(
        subscriber: Subscriber<MessageEvent>,
        streamRef: StreamRef,
        agentId: string,
        query: string,
        conversationId: string | undefined,
        userId: string | undefined,
    ): Promise<void> {
        const startedAt = Date.now();

        if (!userId || !(await this.conversationRepo.hasAgentAccess(userId, agentId))) {
            subscriber.next(encodeSseEvent({ type: 'error', message: 'Access denied' }));
            subscriber.complete();
            return;
        }

        const workspaceId = await this._resolveWorkspaceId(agentId, subscriber);
        if (!workspaceId) return;

        const stream = await this._startOrFail(subscriber, workspaceId, agentId, query, {}, startedAt, false);
        if (!stream) return;
        streamRef.current = stream;

        const convId = await this._initConversation(subscriber, workspaceId, agentId, query, conversationId, userId);
        if (!convId) {
            stream.destroy();
            return;
        }

        const logCtx: LogCtx = { workspaceId, agentId, query, startedAt };
        this.streamForwarder.forward(stream, this.sinkFactory.createPersisting(subscriber, convId, logCtx));
    }

    private async _startOrFail(
        subscriber: Subscriber<MessageEvent>,
        workspaceId: string,
        agentId: string,
        query: string,
        streamOptions: StreamOptions,
        startedAt: number,
        recordFailureLog: boolean,
    ): Promise<RagStream | null> {
        const result = await this._startRagStream(workspaceId, agentId, query, streamOptions);
        if (result.ok) return result.stream;

        subscriber.next(
            encodeSseEvent({ type: 'error', message: result.error, isOutOfCredits: result.isOutOfCredits }),
        );
        subscriber.complete();

        if (recordFailureLog) {
            this.usageRecorder.recordSafely({
                workspaceId,
                agentId,
                query: query.slice(0, 500),
                durationMs: Date.now() - startedAt,
                status: result.isOutOfCredits ? QueryLogStatus.OUT_OF_CREDITS : QueryLogStatus.ERROR,
            });
        }
        return null;
    }

    private async _resolveWorkspaceId(agentId: string, subscriber: Subscriber<MessageEvent>): Promise<string | null> {
        const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });

        if (!agent) {
            subscriber.next(encodeSseEvent({ type: 'error', message: 'Assistant not found' }));
            subscriber.complete();
            return null;
        }

        if (agent.status !== AgentStatus.PRODUCTION) {
            subscriber.next(encodeSseEvent({ type: 'error', message: 'Assistant not available' }));
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
                if (!existing || existing.agentId !== agentId || existing.userId !== userId) {
                    subscriber.next(encodeSseEvent({ type: 'error', message: 'Conversation not found' }));
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
            subscriber.next(encodeSseEvent({ type: 'error', message }));
            subscriber.complete();
            return null;
        }
    }
}
