import type { Logger, MessageEvent } from '@nestjs/common';
import type { Subscriber } from 'rxjs';
import { costToCredits } from 'src/credit/credit-pricing';
import { toClientSafeErrorMessage } from 'src/agent-runtime/client-safe-error';
import { RagStreamOutcome } from 'src/agent-runtime/streaming/rag-stream-accumulator';
import { RagLiveEvent, encodeSseEvent } from 'src/agent-runtime/streaming/runtime-sse-event';

export const EMPTY_ANSWER_MESSAGE = "L'assistant n'a pas pu générer de réponse. Veuillez réessayer.";

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

/**
 * Template for the sinks: live events are forwarded the same way, and the steps shared by every
 * completion (credits of the RAG cost summary, client-facing error of a stream that ended badly) live
 * here; each subclass only decides what to persist/record in onCompleted.
 */
export abstract class BaseResultSink implements RuntimeResultSink {
    protected constructor(protected readonly subscriber: Subscriber<MessageEvent>) {}

    emit(event: RagLiveEvent): void {
        this.subscriber.next(encodeSseEvent(event));
    }

    abstract onCompleted(outcome: StreamCompletionOutcome): Promise<void> | void;

    protected creditsUsed(outcome: StreamCompletionOutcome): number | undefined {
        return outcome.costSummary ? costToCredits(outcome.costSummary.total_cost_usd) : undefined;
    }

    /** Error to show the client for a stream that ended normally: an error event of the RAG engine, or no answer. */
    protected endedStreamErrorMessage(outcome: StreamSuccessOutcome, logger: Logger): string | undefined {
        if (outcome.streamError) {
            return toClientSafeErrorMessage(new Error(outcome.streamError), 'RAG stream error', logger);
        }
        return outcome.fullText ? undefined : EMPTY_ANSWER_MESSAGE;
    }
}
