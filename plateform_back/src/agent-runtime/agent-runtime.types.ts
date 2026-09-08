import type { IncomingMessage } from 'http';

export type RagStream = IncomingMessage;

export interface LogCtx {
    workspaceId: string;
    agentId: string;
    query: string;
    startedAt: number;
}
