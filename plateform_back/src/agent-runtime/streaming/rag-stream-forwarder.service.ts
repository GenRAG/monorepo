import { Injectable } from '@nestjs/common';
import { RagStream } from 'src/agent-runtime/agent-runtime.types';
import { RagStreamAccumulator } from 'src/agent-runtime/streaming/rag-stream-accumulator';
import {
    RuntimeResultSink,
    StreamCompletionOutcome,
} from 'src/agent-runtime/streaming/sinks/runtime-result-sink.interface';

@Injectable()
export class RagStreamForwarderService {
    forward(ragStream: RagStream, sink: RuntimeResultSink): void {
        const accumulator = new RagStreamAccumulator();
        let settled = false;
        const settle = (outcome: StreamCompletionOutcome) => {
            if (settled) return;
            settled = true;
            void sink.onCompleted(outcome);
        };

        ragStream.on('data', (chunk: Buffer) => {
            for (const event of accumulator.push(chunk)) {
                sink.emit(event);
            }
        });

        ragStream.on('end', () => settle({ kind: 'end', ...accumulator.buildOutcome() }));

        ragStream.on('error', (err: Error) => settle({ kind: 'error', error: err, ...accumulator.buildOutcome() }));

        // A client that disconnects destroys the stream, which only emits 'close': without this the usage of an
        // already paid LLM call would never be recorded.
        ragStream.on('close', () =>
            settle({
                kind: 'error',
                error: new Error('Stream closed before completion'),
                ...accumulator.buildOutcome(),
            }),
        );
    }
}
