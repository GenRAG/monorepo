import { describe, it, expect } from '@jest/globals';
import { RagStreamAccumulator } from 'src/agent-runtime/streaming/rag-stream-accumulator';

function ndjson(events: Array<{ type: string; data: unknown }>): Buffer {
    return Buffer.from(events.map((e) => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
}

describe('RagStreamAccumulator', () => {
    it('accumulates token text and emits a chunk event for each token', () => {
        const acc = new RagStreamAccumulator();

        const events = acc.push(
            ndjson([
                { type: 'token', data: 'Hello ' },
                { type: 'token', data: 'world' },
            ]),
        );

        expect(events).toEqual([
            { type: 'chunk', text: 'Hello ' },
            { type: 'chunk', text: 'world' },
        ]);
        expect(acc.buildOutcome().fullText).toBe('Hello world');
    });

    it('emits a sources event live without storing it in the outcome', () => {
        const acc = new RagStreamAccumulator();
        const sources = [{ index: 0, title: 'doc.pdf', score: 0.9 }];

        const events = acc.push(ndjson([{ type: 'sources', data: sources }]));

        expect(events).toEqual([{ type: 'sources', sources }]);
    });

    it('emits a citedSources event live and stores it in the outcome', () => {
        const acc = new RagStreamAccumulator();
        const cited = [{ index: 0, title: 'doc.pdf', score: 0.9 }];

        const events = acc.push(
            ndjson([
                { type: 'citation_check', data: { cited_indices: [0], invalid_indices: [], cited_sources: cited } },
            ]),
        );

        expect(events).toEqual([{ type: 'citedSources', sources: cited }]);
        expect(acc.buildOutcome().citedSources).toEqual(cited);
    });

    it('ignores a citation_check event with no cited_sources', () => {
        const acc = new RagStreamAccumulator();

        const events = acc.push(ndjson([{ type: 'citation_check', data: { cited_indices: [], invalid_indices: [] } }]));

        expect(events).toEqual([]);
        expect(acc.buildOutcome().citedSources).toBeUndefined();
    });

    it('emits a status event live', () => {
        const acc = new RagStreamAccumulator();

        const events = acc.push(ndjson([{ type: 'status', data: 'Running block: retrieve' }]));

        expect(events).toEqual([{ type: 'status', status: 'Running block: retrieve' }]);
    });

    it('stores cost_summary without emitting a live event', () => {
        const acc = new RagStreamAccumulator();

        const events = acc.push(ndjson([{ type: 'cost_summary', data: { total_cost_usd: 0.01 } }]));

        expect(events).toEqual([]);
        expect(acc.buildOutcome().costSummary).toEqual({ total_cost_usd: 0.01 });
    });

    it('stores a string error without emitting a live event', () => {
        const acc = new RagStreamAccumulator();

        const events = acc.push(ndjson([{ type: 'error', data: 'boom' }]));

        expect(events).toEqual([]);
        expect(acc.buildOutcome().streamError).toBe('boom');
    });

    it('falls back to a generic message when the error event has no string payload', () => {
        const acc = new RagStreamAccumulator();

        acc.push(ndjson([{ type: 'error', data: { code: 500 } }]));

        expect(acc.buildOutcome().streamError).toBe('RAG engine error');
    });

    it('buffers a line split across two chunks', () => {
        const acc = new RagStreamAccumulator();
        const full = ndjson([{ type: 'token', data: 'Hello world' }]).toString('utf-8');
        const cut = Math.floor(full.length / 2);

        const first = acc.push(Buffer.from(full.slice(0, cut), 'utf-8'));
        const second = acc.push(Buffer.from(full.slice(cut), 'utf-8'));

        expect(first).toEqual([]);
        expect(second).toEqual([{ type: 'chunk', text: 'Hello world' }]);
    });

    it('ignores malformed JSON lines', () => {
        const acc = new RagStreamAccumulator();

        const events = acc.push(Buffer.from('not json\n', 'utf-8'));

        expect(events).toEqual([]);
    });
});
