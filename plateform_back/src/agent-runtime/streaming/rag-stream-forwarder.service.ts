import { Injectable } from '@nestjs/common';
import { RagStream } from 'src/agent-runtime/agent-runtime.types';
import { RagStreamAccumulator } from 'src/agent-runtime/streaming/rag-stream-accumulator';
import { RuntimeResultSink } from 'src/agent-runtime/streaming/sinks/runtime-result-sink.interface';

@Injectable()
export class RagStreamForwarderService {
    forward(ragStream: RagStream, sink: RuntimeResultSink): void {
        const accumulator = new RagStreamAccumulator();

        ragStream.on('data', (chunk: Buffer) => {
            for (const event of accumulator.push(chunk)) {
                sink.emit(event);
            }
        });

        ragStream.on('end', () => {
            void sink.onCompleted({ kind: 'end', ...accumulator.buildOutcome() });
        });

        ragStream.on('error', (err: Error) => {
            void sink.onCompleted({ kind: 'error', error: err, ...accumulator.buildOutcome() });
        });
    }
}
