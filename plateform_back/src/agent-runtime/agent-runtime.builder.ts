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

        const workflow = prodVersion
            ? await this.workflowService.findByVersion(agentId, prodVersion)
            : await this.workflowService.findActive(agentId);

        if (!workflow) {
            throw new Error('No active workflow found for this agent');
        }

        const def = workflow.definition as Record<string, unknown>;
        const rawBlocks = (def.blocks ?? []) as Record<string, unknown>[];

        return this.applyInstructionOverride(
            rawBlocks,
            instructionOverride,
        ) as unknown as Prisma.JsonValue;
    }

    private applyInstructionOverride(
        blocks: Record<string, unknown>[],
        instruction?: string,
    ): Record<string, unknown>[] {
        if (!instruction) return blocks;
        return blocks.map((b) =>
            b['type'] === 'answer' ? { ...b, instruction } : b,
        );
    }
}
