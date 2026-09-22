import type { MessageEvent } from '@nestjs/common';
import type { Subscriber } from 'rxjs';
import { RagStreamOutcome } from 'src/agent-runtime/streaming/rag-stream-accumulator';
import { RagLiveEvent, encodeSseEvent } from 'src/agent-runtime/streaming/runtime-sse-event';

export interface StreamSuccessOutcome extends RagStreamOutcome {
    kind: 'end';
}

export interface StreamFailureOutcome extends RagStreamOutcome {
    kind: 'error';
    error: Error;
}

export type StreamCompletionOutcome = StreamSuccessOutcome | StreamFailureOutcome;

export interface RuntimeResultSink {
    emit(event: RagLiveEvent): void;
    onCompleted(outcome: StreamCompletionOutcome): Promise<void> | void;
}

export abstract class BaseResultSink implements RuntimeResultSink {
    protected constructor(protected readonly subscriber: Subscriber<MessageEvent>) {}

    emit(event: RagLiveEvent): void {
        this.subscriber.next(encodeSseEvent(event));
    }

    abstract onCompleted(outcome: StreamCompletionOutcome): Promise<void> | void;
}
