import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { AgentService } from 'src/agent/agent.service';
import { WorkflowService } from 'src/workflow/workflow.service';

@Injectable()
export class ContextBuilder {
    constructor(
        private readonly agentService: AgentService,
        private readonly workflowService: WorkflowService,
    ) {}

    async buildPipeline({
        agentId,
        instructionOverride,
    }: {
        agentId: string;
        instructionOverride?: string;
    }): Promise<Prisma.JsonValue> {
        const prodVersion =
            await this.agentService.findProductionWorkflowVersion(agentId);

        if (!prodVersion) {
            throw new Error(
                'No production workflow version found for this agent',
            );
        }

        const workflow = await this.workflowService.findByVersion(
            agentId,
            prodVersion,
        );

        if (!workflow) {
            throw new Error('No active workflow found for this agent');
        }

        const def = workflow.definition as Record<string, unknown>;
        const blocks = (def.blocks ?? []) as Record<string, unknown>[];

        if (instructionOverride) {
            const answerBlock = blocks.find((b) => b['type'] === 'answer');
            if (answerBlock) {
                answerBlock['instruction'] = instructionOverride;
            }
        }

        return blocks as unknown as Prisma.JsonValue;
    }
}
