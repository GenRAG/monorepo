import { Injectable, Logger } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import type { Subscriber } from 'rxjs';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { RuntimeUsageRecorder } from 'src/agent-runtime/usage/runtime-usage-recorder';
import { LogCtx } from 'src/agent-runtime/agent-runtime.types';
import { RuntimeResultSink } from 'src/agent-runtime/streaming/sinks/runtime-result-sink.interface';
import { TransientResultSink } from 'src/agent-runtime/streaming/sinks/transient-result-sink';
import { PersistingResultSink } from 'src/agent-runtime/streaming/sinks/persisting-result-sink';

@Injectable()
export class RuntimeSinkFactory {
    private readonly logger = new Logger('RagStreamForwarder');

    constructor(
        private readonly usageRecorder: RuntimeUsageRecorder,
        private readonly conversationRepo: ConversationRepository,
    ) {}

    createTransient(subscriber: Subscriber<MessageEvent>, logCtx?: LogCtx): RuntimeResultSink {
        return new TransientResultSink(subscriber, this.usageRecorder, this.logger, logCtx);
    }

    createPersisting(subscriber: Subscriber<MessageEvent>, convId: string, logCtx: LogCtx): RuntimeResultSink {
        return new PersistingResultSink(
            subscriber,
            convId,
            logCtx,
            this.usageRecorder,
            this.conversationRepo,
            this.logger,
        );
    }
}
