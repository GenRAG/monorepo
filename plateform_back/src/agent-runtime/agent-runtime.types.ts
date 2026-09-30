import type { IncomingMessage } from 'http';

export type RagStream = IncomingMessage;

export const MAX_RUNTIME_QUERY_LENGTH = 4000;

export interface LogCtx {
    workspaceId: string;
    agentId: string;
    query: string;
    startedAt: number;
}
