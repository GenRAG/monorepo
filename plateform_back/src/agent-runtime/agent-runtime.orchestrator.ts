import { Injectable } from '@nestjs/common';
import EventBus from 'src/lib/event-bus';
import { ContextBuilder } from 'src/agent-runtime/agent-runtime.builder';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { UsageTrackerService } from 'src/usage-tracker/usage-tracker.service';
import { AgentQueryCompletedEvent } from 'src/events/agent-events';
import { AgentEventType } from 'src/events/agent-events.type';

@Injectable()
export class AgentRuntimeOrchestrator {
    constructor(
        private readonly contextBuilder: ContextBuilder,
        private readonly ragEngineService: RagEngineService,
        private readonly usageTracker: UsageTrackerService,
    ) {}

    async execute({
        query,
        agentId,
        workspaceId,
    }: {
        query: string;
        agentId: string;
        workspaceId: string;
    }) {
        await this.usageTracker.checkOrThrow(workspaceId);

        const pipeline = await this.contextBuilder.buildPipeline({
            agentId,
            workspaceId,
        });

        const answer = await this.ragEngineService.sendQuery({
            pipeline,
            query,
        });

        if (!answer) {
            throw new Error('Failed to get an answer from the RAG engine.');
        }

        EventBus.emit(
            AgentEventType.AGENT_QUERY_COMPLETED,
            new AgentQueryCompletedEvent(workspaceId, agentId, undefined),
        );

        return { answer };
    }
}
