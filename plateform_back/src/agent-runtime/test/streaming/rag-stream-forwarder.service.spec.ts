import { EventEmitter } from 'events';
import { jest, describe, it, expect } from '@jest/globals';
import { RagStreamForwarderService } from 'src/agent-runtime/streaming/rag-stream-forwarder.service';
import { RuntimeResultSink } from 'src/agent-runtime/streaming/sinks/runtime-result-sink.interface';

function createMockStream() {
    return new EventEmitter() as any;
}

function ndjson(events: Array<{ type: string; data: unknown }>): Buffer {
    return Buffer.from(events.map((e) => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
}

function createSpySink() {
    const sink = { emit: jest.fn(), onCompleted: jest.fn() };
    return { sink, asSink: sink as unknown as RuntimeResultSink };
}

describe('RagStreamForwarderService', () => {
    const service = new RagStreamForwarderService();

    it('forwards each live event to the sink as it arrives', () => {
        const stream = createMockStream();
        const { sink, asSink } = createSpySink();

        service.forward(stream, asSink);
        stream.emit('data', ndjson([{ type: 'token', data: 'Hello' }]));
        stream.emit('data', ndjson([{ type: 'status', data: 'thinking' }]));

        expect(sink.emit).toHaveBeenNthCalledWith(1, { type: 'chunk', text: 'Hello' });
        expect(sink.emit).toHaveBeenNthCalledWith(2, { type: 'status', status: 'thinking' });
        expect(sink.onCompleted).not.toHaveBeenCalled();
    });

    it('calls onCompleted with the accumulated outcome on stream end', () => {
        const stream = createMockStream();
        const { sink, asSink } = createSpySink();

        service.forward(stream, asSink);
        stream.emit('data', ndjson([{ type: 'token', data: 'Hello' }]));
        stream.emit('data', ndjson([{ type: 'cost_summary', data: { total_cost_usd: 0.01 } }]));
        stream.emit('end');

        expect(sink.onCompleted).toHaveBeenCalledWith({
            kind: 'end',
            fullText: 'Hello',
            costSummary: { total_cost_usd: 0.01 },
            streamError: undefined,
            citedSources: undefined,
        });
    });

    it('calls onCompleted with the raw error and whatever was accumulated so far on stream error', () => {
        const stream = createMockStream();
        const { sink, asSink } = createSpySink();
        const err = new Error('socket hang up');

        service.forward(stream, asSink);
        stream.emit('data', ndjson([{ type: 'token', data: 'Partial' }]));
        stream.emit('error', err);

        expect(sink.onCompleted).toHaveBeenCalledWith({
            kind: 'error',
            error: err,
            fullText: 'Partial',
            costSummary: undefined,
            streamError: undefined,
            citedSources: undefined,
        });
    });

    it('settles with the partial outcome when the stream is destroyed before ending (client disconnect)', () => {
        const stream = createMockStream();
        const { sink, asSink } = createSpySink();

        service.forward(stream, asSink);
        stream.emit('data', ndjson([{ type: 'token', data: 'Partial' }]));
        stream.emit('close');

        expect(sink.onCompleted).toHaveBeenCalledWith(
            expect.objectContaining({ kind: 'error', fullText: 'Partial', error: expect.any(Error) }),
        );
    });

    it('settles only once when close follows end', () => {
        const stream = createMockStream();
        const { sink, asSink } = createSpySink();

        service.forward(stream, asSink);
        stream.emit('end');
        stream.emit('close');

        expect(sink.onCompleted).toHaveBeenCalledTimes(1);
        expect(sink.onCompleted).toHaveBeenCalledWith(expect.objectContaining({ kind: 'end' }));
    });
});
