import {
    EventType,
    NdjsonLineBuffer,
    RagCitationCheck,
    RagCostSummary,
    RagSources,
} from 'src/rag-engine/ndjson-line-buffer';
import { RagLiveEvent } from 'src/agent-runtime/streaming/runtime-sse-event';

export interface RagStreamOutcome {
    fullText: string;
    costSummary?: RagCostSummary;
    streamError?: string;
    citedSources?: RagSources[];
}

export class RagStreamAccumulator {
    private readonly lineBuffer = new NdjsonLineBuffer();
    private fullText = '';
    private costSummary?: RagCostSummary;
    private streamError?: string;
    private citedSources?: RagSources[];

    private readonly handlers: Record<EventType, (data: unknown) => RagLiveEvent | undefined> = {
        [EventType.Token]: (data) => {
            const text = data as string;
            this.fullText += text;
            return { type: 'chunk', text };
        },

        [EventType.Sources]: (data) => ({ type: 'sources', sources: data as RagSources[] }),

        [EventType.CitationCheck]: (data) => {
            const check = data as RagCitationCheck;
            if (!check.cited_sources) return undefined;
            this.citedSources = check.cited_sources;
            return { type: 'citedSources', sources: check.cited_sources };
        },

        [EventType.Status]: (data) => (typeof data === 'string' ? { type: 'status', status: data } : undefined),

        [EventType.CostSummary]: (data) => {
            this.costSummary = data as RagCostSummary;
            return undefined;
        },

        [EventType.Error]: (data) => {
            this.streamError = typeof data === 'string' ? data : 'RAG engine error';
            return undefined;
        },
    };

    push(chunk: Buffer): RagLiveEvent[] {
        const events: RagLiveEvent[] = [];
        for (const rawEvent of this.lineBuffer.push(chunk.toString('utf-8'))) {
            const live = this.handlers[rawEvent.type]?.(rawEvent.data);
            if (live) events.push(live);
        }
        return events;
    }

    buildOutcome(): RagStreamOutcome {
        return {
            fullText: this.fullText,
            costSummary: this.costSummary,
            streamError: this.streamError,
            citedSources: this.citedSources,
        };
    }
}
