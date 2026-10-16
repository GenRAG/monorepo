import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AgentService } from 'src/agent/agent.service';
import { WorkflowService } from 'src/workflow/workflow.service';
import { DatasetService } from 'src/dataset/dataset.service';
import { Pipeline, PipelineBlock, PipelineSchema } from 'src/rag-engine/pipeline.schema';

type RawBlock = Record<string, unknown>;

const isRetrieveBlock = (block: unknown): block is RawBlock =>
    typeof block === 'object' && block !== null && (block as RawBlock).type === 'retrieve';

/** Stored blocks keep the builder's field names; the RAG engine reads the rewrite model as `model_name`. */
const toEngineBlock = (block: unknown): unknown => {
    if (typeof block !== 'object' || block === null || (block as RawBlock).type !== 'query_rewrite') return block;
    const { model, ...rest } = block as RawBlock;
    return { ...rest, model_name: model ?? rest.model_name };
};

const datasetIdsOf = (retrieve: RawBlock): string[] =>
    Array.isArray(retrieve.datasetIds) ? retrieve.datasetIds.filter((id): id is string => typeof id === 'string') : [];

@Injectable()
export class RagPipelineBuilder {
    private readonly logger = new Logger(RagPipelineBuilder.name);

    constructor(
        private readonly agentService: AgentService,
        private readonly workflowService: WorkflowService,
        private readonly datasetService: DatasetService,
    ) {}

    async buildPipeline({
        agentId,
        instructionOverride,
        orgIdOverride,
        forceActive = false,
    }: {
        agentId: string;
        instructionOverride?: string;
        /** Server-side tenant (e.g. the shared onboarding demo base) replacing the agent's datasets. */
        orgIdOverride?: string;
        forceActive?: boolean;
    }): Promise<Pipeline> {
        const rawBlocks = await this.loadRawBlocks(agentId, forceActive);
        if (rawBlocks === null) {
            throw new NotFoundException('No active workflow found for this agent');
        }

        const blocks = Array.isArray(rawBlocks)
            ? (await this.resolveRetrieveBlocks(agentId, rawBlocks, orgIdOverride)).map(toEngineBlock)
            : rawBlocks;

        const result = PipelineSchema.safeParse(blocks);
        if (!result.success) {
            const details = result.error.issues.map((i) => `[${i.path.join('.')}] ${i.message}`).join('; ');
            throw new UnprocessableEntityException(`Pipeline invalide : ${details}`);
        }

        return this.applyInstructionOverride(result.data, instructionOverride);
    }

    /** Datasets the deployed agent actually searches: the same ones its pipeline sends to the RAG engine. */
    async resolveDatasetIds(agentId: string): Promise<string[]> {
        const rawBlocks = await this.loadRawBlocks(agentId, false);
        const retrieve = Array.isArray(rawBlocks) ? rawBlocks.find(isRetrieveBlock) : undefined;
        if (!retrieve) return [];
        return this.datasetService.resolveDatasetIdsForAgent(agentId, datasetIdsOf(retrieve));
    }

    /** Blocks of the production workflow (the active one if never deployed, or with forceActive); null without workflow. */
    private async loadRawBlocks(agentId: string, forceActive: boolean): Promise<unknown> {
        const prodVersion = forceActive ? null : await this.agentService.findProductionWorkflowVersion(agentId);

        const workflow = prodVersion
            ? await this.workflowService.findByVersion(agentId, prodVersion)
            : await this.workflowService.findActive(agentId);
        if (!workflow) return null;

        // Legacy workflows stored the blocks array directly as the definition.
        const def = workflow.definition as Record<string, unknown> | unknown[];
        return Array.isArray(def) ? def : (def.blocks ?? []);
    }

    /**
     * The stored retrieve block only carries the `datasetIds` chosen in the builder. They are replaced by the
     * datasets the agent may search; a retrieve block with none is dropped. With an org override (a server-side
     * base), the whole org is searched. Other stored fields (`collection_name`, tenant ids) are stripped by
     * `PipelineSchema`.
     */
    private async resolveRetrieveBlocks(
        agentId: string,
        blocks: unknown[],
        orgIdOverride?: string,
    ): Promise<unknown[]> {
        const retrieve = blocks.find(isRetrieveBlock);
        if (!retrieve) return blocks;

        const datasetIds = orgIdOverride
            ? undefined
            : await this.datasetService.resolveDatasetIdsForAgent(agentId, datasetIdsOf(retrieve));

        if (datasetIds?.length === 0) {
            this.logger.log(`Agent ${agentId}: no dataset available, retrieve block skipped`);
            return blocks.filter((block) => !isRetrieveBlock(block));
        }

        return blocks.map((block) => {
            if (!isRetrieveBlock(block)) return block;
            const { datasetIds: _stored, ...rest } = block;
            return datasetIds ? { ...rest, datasetIds } : rest;
        });
    }

    private applyInstructionOverride(blocks: Pipeline, instruction?: string): Pipeline {
        if (!instruction) return blocks;
        return blocks.map((b): PipelineBlock => (b.type === 'answer' ? { ...b, system_prompt: instruction } : b));
    }
}
