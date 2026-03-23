import { Injectable } from '@nestjs/common';
import { ContextBuilder } from 'src/agent-runtime/agent-runtime.builder';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { UsageTrackerService } from 'src/usage-tracker/usage-tracker.service';

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

        await this.usageTracker.record({
            workspaceId,
            agentId,
            tokensUsed: undefined,
        });

        return { answer };
    }
}
