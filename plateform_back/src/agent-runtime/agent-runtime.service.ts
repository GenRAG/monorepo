import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { AgentStatus, MessageSender } from 'generated/prisma';
import { Observable, Subscriber } from 'rxjs';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { PrismaService } from 'src/prisma/prisma.service';

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
    ) {}

    streamQuery(workspaceId: string, agentId: string, query: string): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            void this._dispatchStream(subscriber, workspaceId, agentId, query);
        });
    }

    playgroundStream(workspaceId: string, agentId: string, query: string): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            void this._dispatchStream(subscriber, workspaceId, agentId, query, {
                skipUsageTracking: true,
                forceActiveWorkflow: true,
            });
        });
    }

    streamWithOrgOverride(
        workspaceId: string,
        agentId: string,
        query: string,
        orgIdOverride: string,
    ): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            void this._dispatchStream(subscriber, workspaceId, agentId, query, { orgIdOverride });
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
        const ragStream = await this._startRagStream(subscriber, workspaceId, agentId, query, options);
        if (!ragStream) return;
        this._forwardStream(ragStream, subscriber);
    }

    private async _dispatchStreamWithPersistence(
        subscriber: Subscriber<MessageEvent>,
        agentId: string,
        query: string,
        conversationId?: string,
        userId?: string,
    ) {
        const workspaceId = await this._resolveWorkspaceId(agentId, subscriber);
        if (!workspaceId) return;

        const ragStream = await this._startRagStream(subscriber, workspaceId, agentId, query);
        if (!ragStream) return;

        const convId = await this._initConversation(subscriber, workspaceId, agentId, query, conversationId, userId);
        if (!convId) {
            ragStream.destroy();
            return;
        }

        this._forwardStreamWithPersistence(ragStream, convId, subscriber);
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
        subscriber: Subscriber<MessageEvent>,
        workspaceId: string,
        agentId: string,
        query: string,
        { orgIdOverride, skipUsageTracking = false, forceActiveWorkflow = false }: StreamOptions = {},
    ): Promise<Awaited<ReturnType<typeof this.orchestrator.streamQuery>> | null> {
        try {
            return await this.orchestrator.streamQuery({
                query,
                agentId,
                workspaceId,
                orgIdOverride,
                skipUsageTracking,
                forceActiveWorkflow,
            });
        } catch (err: unknown) {
            const isOutOfCredits = err instanceof ForbiddenException;
            subscriber.next({
                data: JSON.stringify({
                    error: isOutOfCredits
                        ? 'Pas de crédits disponibles.'
                        : err instanceof Error
                          ? err.message
                          : 'Unknown error',
                    isOutOfCredits,
                }),
            });
            subscriber.complete();
            return null;
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

    private _forwardStream(
        ragStream: Awaited<ReturnType<typeof this.orchestrator.streamQuery>>,
        subscriber: Subscriber<MessageEvent>,
    ) {
        ragStream.on('data', (chunk: Buffer) => {
            subscriber.next({ data: JSON.stringify({ chunk: chunk.toString('utf-8') }) });
        });
        ragStream.on('end', () => {
            subscriber.next({ data: JSON.stringify({ done: true }) });
            subscriber.complete();
        });
        ragStream.on('error', (err: Error) => {
            subscriber.next({ data: JSON.stringify({ error: err.message }) });
            subscriber.complete();
        });
    }

    private _forwardStreamWithPersistence(
        ragStream: Awaited<ReturnType<typeof this.orchestrator.streamQuery>>,
        convId: string,
        subscriber: Subscriber<MessageEvent>,
    ) {
        let fullText = '';

        ragStream.on('data', (chunk: Buffer) => {
            const text = chunk.toString('utf-8');
            fullText += text;
            subscriber.next({ data: JSON.stringify({ chunk: text }) });
        });

        ragStream.on('end', () => {
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
                .catch((e: Error) =>
                    this.logger.error(`Failed to persist agent message for conv ${convId}: ${e.message}`),
                )
                .finally(() => {
                    subscriber.next({ data: JSON.stringify({ done: true, conversationId: convId }) });
                    subscriber.complete();
                });
        });

        ragStream.on('error', (err: Error) => {
            void this.prisma.message
                .create({
                    data: {
                        conversationId: convId,
                        sender: MessageSender.AGENT,
                        content: fullText || err.message,
                    },
                })
                .catch((e: Error) =>
                    this.logger.error(`Failed to persist error message for conv ${convId}: ${e.message}`),
                )
                .finally(() => {
                    subscriber.next({ data: JSON.stringify({ error: err.message }) });
                    subscriber.complete();
                });
        });
    }
}
