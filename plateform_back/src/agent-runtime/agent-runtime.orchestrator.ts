import { Injectable } from '@nestjs/common';
import type { IncomingMessage } from 'http';
import EventBus from 'src/lib/event-bus';
import { ContextBuilder } from 'src/agent-runtime/agent-runtime.builder';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { UsageTrackerService } from 'src/usage-tracker/usage-tracker.service';
import { AgentQueryCompletedEvent } from 'src/events/agent/agent-events';
import { AgentEventType } from 'src/events/agent/agent-events.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentRuntimeOrchestrator {
    private readonly mock: boolean;
    constructor(
        private readonly contextBuilder: ContextBuilder,
        private readonly ragEngineService: RagEngineService,
        private readonly usageTracker: UsageTrackerService,
        private readonly configService: ConfigService,
    ) {
        this.mock = this.configService.get<string>('RAG_MOCK') === 'true';
    }

    async execute({
        query,
        agentId,
        workspaceId,
        instructionOverride,
        orgIdOverride,
        skipUsageTracking = false,
    }: {
        query: string;
        agentId: string;
        workspaceId: string;
        instructionOverride?: string;
        orgIdOverride?: string;
        skipUsageTracking?: boolean;
    }) {
        if (!skipUsageTracking) {
            await this.usageTracker.checkOrThrow(workspaceId);
        }

        const pipeline = await this.contextBuilder.buildPipeline({
            agentId,
            instructionOverride,
        });

        const answer = await this.ragEngineService.sendQuery({
            pipeline,
            query,
            orgId: orgIdOverride ?? agentId,
            mock: this.mock,
        });

        if (!answer) {
            throw new Error('Failed to get an answer from the RAG engine.');
        }

        if (!skipUsageTracking) {
            EventBus.emit(
                AgentEventType.AGENT_QUERY_COMPLETED,
                new AgentQueryCompletedEvent(workspaceId, agentId, undefined),
            );
        }

        return { answer };
    }

    async stream({
        query,
        agentId,
        workspaceId,
        orgIdOverride,
        skipUsageTracking = false,
        forceActiveWorkflow = false,
    }: {
        query: string;
        agentId: string;
        workspaceId: string;
        orgIdOverride?: string;
        skipUsageTracking?: boolean;
        forceActiveWorkflow?: boolean;
    }): Promise<IncomingMessage> {
        if (!skipUsageTracking) {
            await this.usageTracker.checkOrThrow(workspaceId);
        }

        const pipeline = await this.contextBuilder.buildPipeline({
            agentId,
            forceActive: forceActiveWorkflow,
        });

        const ragStream = await this.ragEngineService.getQueryStream({
            pipeline,
            query,
            orgId: orgIdOverride ?? agentId,
            mock: this.mock,
        });

        if (!skipUsageTracking) {
            ragStream.once('end', () => {
                EventBus.emit(
                    AgentEventType.AGENT_QUERY_COMPLETED,
                    new AgentQueryCompletedEvent(workspaceId, agentId, undefined),
                );
            });
        }

        return ragStream;
    }
}
