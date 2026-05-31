import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AgentService } from 'src/agent/agent.service';
import { WorkflowService } from 'src/workflow/workflow.service';
import { Pipeline, PipelineBlock, PipelineSchema } from 'src/rag-engine/pipeline.schema';

@Injectable()
export class RagPipelineBuilder {
    constructor(
        private readonly agentService: AgentService,
        private readonly workflowService: WorkflowService,
    ) {}

    async buildPipeline({
        agentId,
        instructionOverride,
        forceActive = false,
    }: {
        agentId: string;
        instructionOverride?: string;
        forceActive?: boolean;
    }): Promise<Pipeline> {
        const prodVersion = forceActive ? null : await this.agentService.findProductionWorkflowVersion(agentId);

        const workflow = prodVersion
            ? await this.workflowService.findByVersion(agentId, prodVersion)
            : await this.workflowService.findActive(agentId);

        if (!workflow) {
            throw new NotFoundException('No active workflow found for this agent');
        }

        const def = workflow.definition as Record<string, unknown>;
        const rawBlocks = def.blocks ?? [];

        const result = PipelineSchema.safeParse(rawBlocks);
        if (!result.success) {
            const details = result.error.issues.map((i) => `[${i.path.join('.')}] ${i.message}`).join('; ');
            throw new UnprocessableEntityException(`Pipeline invalide : ${details}`);
        }

        return this.applyInstructionOverride(result.data, instructionOverride);
    }

    private applyInstructionOverride(blocks: Pipeline, instruction?: string): Pipeline {
        if (!instruction) return blocks;
        return blocks.map((b): PipelineBlock => (b.type === 'answer' ? { ...b, system_prompt: instruction } : b));
    }
}
