import type { MessageEvent } from '@nestjs/common';
import { RagSources } from 'src/rag-engine/ndjson-line-buffer';

export type RuntimeSseEvent =
    | { type: 'chunk'; text: string }
    | { type: 'sources'; sources: RagSources[] }
    | { type: 'citedSources'; sources: RagSources[] }
    | { type: 'status'; status: string }
    | { type: 'error'; message: string; isOutOfCredits?: boolean }
    | { type: 'done'; conversationId?: string; durationMs?: number };

export type RagLiveEvent = Extract<RuntimeSseEvent, { type: 'chunk' | 'sources' | 'citedSources' | 'status' }>;

export function encodeSseEvent(event: RuntimeSseEvent): MessageEvent {
    switch (event.type) {
        case 'chunk':
            return { data: JSON.stringify({ chunk: event.text }) };
        case 'sources':
            return { data: JSON.stringify({ sources: event.sources }) };
        case 'citedSources':
            return { data: JSON.stringify({ citedSources: event.sources }) };
        case 'status':
            return { data: JSON.stringify({ status: event.status }) };
        case 'error':
            return {
                data: JSON.stringify({
                    error: event.message,
                    ...(event.isOutOfCredits !== undefined ? { isOutOfCredits: event.isOutOfCredits } : {}),
                }),
            };
        case 'done':
            return {
                data: JSON.stringify({
                    done: true,
                    ...(event.conversationId ? { conversationId: event.conversationId } : {}),
                    ...(event.durationMs !== undefined ? { durationMs: event.durationMs } : {}),
                }),
            };
        default:
            return assertNever(event);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled RuntimeSseEvent: ${JSON.stringify(value)}`);
}
