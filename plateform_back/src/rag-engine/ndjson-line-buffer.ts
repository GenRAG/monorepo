export interface RagStreamEvent {
    type: string;
    data: unknown;
}

export interface RagCostSummary {
    total_cost_usd: number;
    by_model?: Record<string, number>;
    by_type?: Record<string, number>;
}

export class NdjsonLineBuffer {
    private buffer = '';

    push(chunk: string): RagStreamEvent[] {
        this.buffer += chunk;
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() ?? '';
        return this.parseLines(lines);
    }

    flush(): RagStreamEvent[] {
        const remaining = this.buffer;
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
