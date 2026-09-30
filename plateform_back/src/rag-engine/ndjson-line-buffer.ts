import { StringDecoder } from 'string_decoder';

export interface RagStreamEvent {
    type: EventType;
    data: unknown;
}

export interface RagCostSummary {
    total_cost_usd: number;
    by_model?: Record<string, number>;
    by_type?: Record<string, number>;
}

export interface RagSources {
    index: number;
    title: string;
    score: number | null;
    text_preview?: string;
}

export interface RagCitationCheck {
    cited_indices: number[];
    invalid_indices: number[];
    cited_sources?: RagSources[];
}

export enum EventType {
    Token = 'token',
    CostSummary = 'cost_summary',
    Error = 'error',
    Sources = 'sources',
    Status = 'status',
    CitationCheck = 'citation_check',
}

export class NdjsonLineBuffer {
    private buffer = '';
    // Network chunks can split a multi-byte UTF-8 character (é, emoji…): the decoder keeps the
    // incomplete bytes until the next chunk instead of emitting U+FFFD replacement characters.
    private readonly decoder = new StringDecoder('utf8');

    push(chunk: Buffer | string): RagStreamEvent[] {
        this.buffer += typeof chunk === 'string' ? chunk : this.decoder.write(chunk);
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() ?? '';
        return this.parseLines(lines);
    }

    flush(): RagStreamEvent[] {
        const remaining = this.buffer + this.decoder.end();
        this.buffer = '';
        return this.parseLines([remaining]);
    }

    private parseLines(lines: string[]): RagStreamEvent[] {
        const events: RagStreamEvent[] = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
                events.push(JSON.parse(trimmed) as RagStreamEvent);
            } catch {
                /**/
            }
        }
        return events;
    }
}
