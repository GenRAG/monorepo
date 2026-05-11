import { ForbiddenException, Injectable } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { AgentStatus, MessageSender } from 'generated/prisma';
import { Observable, Subscriber } from 'rxjs';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AgentRuntimeService {
    constructor(
        private readonly orchestrator: AgentRuntimeOrchestrator,
        private readonly prisma: PrismaService,
    ) {}

    stream(
        workspaceId: string,
        agentId: string,
        query: string,
    ): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            void this._runStream(subscriber, workspaceId, agentId, query);
        });
    }

    streamWithPersistence(
        agentId: string,
        query: string,
        conversationId?: string,
    ): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            void this._runStreamWithPersistence(
                subscriber,
                agentId,
                query,
                conversationId,
            );
        });
    }

    private async _runStream(
        subscriber: Subscriber<MessageEvent>,
        workspaceId: string,
        agentId: string,
        query: string,
    ) {
        const ragStream = await this._startRagStream(
            subscriber,
            workspaceId,
            agentId,
            query,
        );
        if (!ragStream) return;
        this._pipeStream(ragStream, subscriber);
    }

    private async _runStreamWithPersistence(
        subscriber: Subscriber<MessageEvent>,
        agentId: string,
        query: string,
        conversationId?: string,
    ) {
        const workspaceId = await this._resolveWorkspaceId(agentId, subscriber);
        if (!workspaceId) return;

        const ragStream = await this._startRagStream(
            subscriber,
            workspaceId,
            agentId,
            query,
        );
        if (!ragStream) return;

        const convId = await this._initConversation(
            subscriber,
            workspaceId,
            agentId,
            query,
            conversationId,
        );
        if (!convId) return;

        this._pipeStreamWithPersistence(ragStream, convId, subscriber);
    }

    private async _resolveWorkspaceId(
        agentId: string,
        subscriber: Subscriber<MessageEvent>,
    ): Promise<string | null> {
        const agent = await this.prisma.agent.findUnique({
            where: { id: agentId },
        });
        if (!agent) {
            subscriber.next({
                data: JSON.stringify({ error: 'Assistant not found' }),
            });
            subscriber.complete();
            return null;
        }
        if (agent.status !== AgentStatus.PRODUCTION) {
            subscriber.next({
                data: JSON.stringify({ error: 'Assistant not available' }),
            });
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
    ): Promise<Awaited<ReturnType<typeof this.orchestrator.stream>> | null> {
        try {
            return await this.orchestrator.stream({
                query,
                agentId,
                workspaceId,
            });
        } catch (err: any) {
            const isOutOfCredits = err instanceof ForbiddenException;
            subscriber.next({
                data: JSON.stringify({
                    error: isOutOfCredits
                        ? 'Pas de crédits disponibles.'
                        : (err?.message ?? 'Unknown error'),
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
    ): Promise<string | null> {
        try {
            let convId: string;

            if (conversationId) {
                const existing = await this.prisma.conversation.findUnique({
                    where: { id: conversationId },
                });
                if (!existing || existing.agentId !== agentId) {
                    subscriber.next({
                        data: JSON.stringify({
                            error: 'Conversation not found',
                        }),
                    });
                    subscriber.complete();
                    return null;
                }
                convId = conversationId;
            } else {
                convId = (
                    await this.prisma.conversation.create({
                        data: {
                            agentId,
                            workspaceId,
                            title: query.slice(0, 60),
                        },
                    })
                ).id;
            }

            await this.prisma.message.create({
                data: {
                    conversationId: convId,
                    sender: MessageSender.USER,
                    content: query,
                },
            });

            return convId;
        } catch (err: any) {
            subscriber.next({
                data: JSON.stringify({
                    error: err?.message ?? 'Failed to initialize conversation',
                }),
            });
            subscriber.complete();
            return null;
        }
    }

    private _pipeStream(
        ragStream: Awaited<ReturnType<typeof this.orchestrator.stream>>,
        subscriber: Subscriber<MessageEvent>,
    ) {
        ragStream.on('data', (chunk: Buffer) => {
            subscriber.next({
                data: JSON.stringify({ chunk: chunk.toString('utf-8') }),
            });
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

    private _pipeStreamWithPersistence(
        ragStream: Awaited<ReturnType<typeof this.orchestrator.stream>>,
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
                    data: {
                        conversationId: convId,
                        sender: MessageSender.AGENT,
                        content: fullText,
                    },
                })
                .then(() =>
                    this.prisma.conversation.update({
                        where: { id: convId },
                        data: { updatedAt: new Date() },
                    }),
                )
                .catch(() => {})
                .finally(() => {
                    subscriber.next({
                        data: JSON.stringify({
                            done: true,
                            conversationId: convId,
                        }),
                    });
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
                .catch(() => {})
                .finally(() => {
                    subscriber.next({
                        data: JSON.stringify({ error: err.message }),
                    });
                    subscriber.complete();
                });
        });
    }
}
