import { Injectable, Logger } from '@nestjs/common';
import type { IncomingMessage } from 'http';
import * as Sentry from '@sentry/nestjs';
import { QueryLogStatus } from 'generated/prisma';
import EventBus from 'src/lib/event-bus';
import { RagPipelineBuilder } from 'src/agent-runtime/agent-runtime.builder';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import type { Pipeline } from 'src/rag-engine/pipeline.schema';
import { UsageTrackerService } from 'src/credit/usage-tracker.service';
import { costToCredits } from 'src/credit/credit-pricing';
import { AgentQueryCompletedEvent } from 'src/events/agent/agent-events';
import { AgentEventType } from 'src/events/agent/agent-events.type';
import { ConfigService } from '@nestjs/config';

interface PrepareOptions {
    agentId: string;
    workspaceId: string;
    orgIdOverride?: string;
    skipUsageTracking?: boolean;
    instructionOverride?: string;
    forceActive?: boolean;
}

@Injectable()
export class AgentRuntimeOrchestrator {
    private readonly logger = new Logger(AgentRuntimeOrchestrator.name);
    private readonly mock: boolean;

    constructor(
        private readonly pipelineBuilder: RagPipelineBuilder,
        private readonly ragEngineService: RagEngineService,
        private readonly usageTracker: UsageTrackerService,
        private readonly configService: ConfigService,
    ) {
        this.mock = this.configService.get<string>('RAG_MOCK') === 'true';
    }

    async executeQuery({
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
    }): Promise<{ answer: string }> {
        const startedAt = Date.now();
        const { pipeline, orgId } = await this._prepare({
            agentId,
            workspaceId,
            orgIdOverride,
            skipUsageTracking,
            instructionOverride,
        });

        const { answer, costUsd } = await this.ragEngineService.sendQuery({ pipeline, query, orgId, mock: this.mock });

        if (!answer) {
            throw new Error('Failed to get an answer from the RAG engine.');
        }

        if (!skipUsageTracking) {
            void this.usageTracker
                .recordQuery({
                    workspaceId,
                    agentId,
                    query: query.slice(0, 500),
                    durationMs: Date.now() - startedAt,
                    status: QueryLogStatus.SUCCESS,
                    creditsUsed: costToCredits(costUsd),
                })
                .catch((e: Error) => {
                    this.logger.error(`Failed to record query: ${e.message}`);
                    Sentry.captureException(e);
                });

            EventBus.emit(
                AgentEventType.AGENT_QUERY_COMPLETED,
                new AgentQueryCompletedEvent(workspaceId, agentId, undefined),
            );
        }

        return { answer };
    }

    async streamQuery({
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
        const { pipeline, orgId } = await this._prepare({
            agentId,
            workspaceId,
            orgIdOverride,
            skipUsageTracking,
            forceActive: forceActiveWorkflow,
        });

        return this.ragEngineService.getQueryStream({ pipeline, query, orgId, mock: this.mock });
    }

    private async _prepare({
        agentId,
        workspaceId,
        orgIdOverride,
        skipUsageTracking = false,
        instructionOverride,
        forceActive = false,
    }: PrepareOptions): Promise<{ pipeline: Pipeline; orgId: string }> {
        if (!skipUsageTracking) {
            await this.usageTracker.checkOrThrow(workspaceId);
        }

        const pipeline = await this.pipelineBuilder.buildPipeline({ agentId, instructionOverride, forceActive });

        return { pipeline, orgId: orgIdOverride ?? agentId };
    }
}
