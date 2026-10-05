import type { Edge } from "@xyflow/react";
import type { AppNode } from "../types/app-node";
import type { PipelineBlock } from "../types/pipeline";
import { TaskType, type TaskSpecRegistry } from "../types/task";
import { linkNodes, makeFlowNode, withAutoSettings } from "../graph/create-flow-node";
import { TASK_SPECS } from "../graph/task-specs";
import { type LayoutStrategy, DEFAULT_LAYOUT } from "../layout";

const TASK_TYPE_BY_BLOCK: Record<PipelineBlock["type"], TaskType> = {
    query: TaskType.QUERY,
    query_rewrite: TaskType.REWRITER,
    retrieve: TaskType.RETRIEVER,
    rerank: TaskType.RERANKER,
    answer: TaskType.RESPONSE,
};

export class UnsupportedPipelineBlockError extends Error {
    constructor(
        readonly blockType: unknown,
        readonly index: number,
    ) {
        super(`Unsupported pipeline block type ${JSON.stringify(blockType)} at index ${index}`);
        this.name = "UnsupportedPipelineBlockError";
    }
}

export interface PipelineToWorkflowOptions {
    /** Where to place the chain and its settings (default: vertical). */
    layout?: LayoutStrategy;
    /** Task specs used to name the settings (default: TASK_SPECS). */
    registry?: TaskSpecRegistry;
}

/** Setting values of a block, keyed by the input names of its task (the first MODEL / INSTRUCTION input). */
function settingValuesOf(block: PipelineBlock, type: TaskType, registry: TaskSpecRegistry): Record<string, string> {
    const inputs = registry[type]?.inputs ?? [];
    const values: Record<string, string> = {};
    const modelInput = inputs.find((i) => i.nodeType === TaskType.MODEL);
    const instructionInput = inputs.find((i) => i.nodeType === TaskType.INSTRUCTION);
    if ("model" in block && modelInput) values[modelInput.name] = block.model;
    if ("system_prompt" in block && block.system_prompt && instructionInput) {
        values[instructionInput.name] = block.system_prompt;
    }
    return values;
}

/**
 * Rebuilds the builder graph from a RAG pipeline (`definition.blocks`, the format sent to the engine):
 * one chain node per block, linked in order, with its MODEL / INSTRUCTION settings filled from the block
 * (placeholders when missing). Node ids are the block names (suffixed when repeated).
 *
 * Inverse of `serializeWorkflow` for the settings the builder exposes: `collection_name` and `top_k` of a
 * retrieve block have no node and are not kept.
 *
 * @throws UnsupportedPipelineBlockError on a block type the builder does not know.
 */
export function pipelineToWorkflow(
    blocks: readonly PipelineBlock[],
    options: PipelineToWorkflowOptions = {},
): { nodes: AppNode[]; edges: Edge[] } {
    const layout = options.layout ?? DEFAULT_LAYOUT;
    const registry = options.registry ?? TASK_SPECS;
    const nodes: AppNode[] = [];
    const edges: Edge[] = [];
    const settingValues: Record<string, Record<string, string>> = {};
    const usedIds = new Set<string>();

    blocks.forEach((block, index) => {
        const type = TASK_TYPE_BY_BLOCK[block?.type];
        if (!type) throw new UnsupportedPipelineBlockError(block?.type, index);

        const baseId = block.name || block.type;
        let id = baseId;
        for (let n = 2; usedIds.has(id); n += 1) id = `${baseId}-${n}`;
        usedIds.add(id);

        const previous = nodes[nodes.length - 1];
        const node = makeFlowNode(id, type, 0, 0);
        nodes.push(node);
        if (previous) edges.push(linkNodes(previous.id, id));
        node.position = layout.computePlacements(nodes, edges, id)[0]?.position ?? layout.getInitialPosition();

        settingValues[id] = settingValuesOf(block, type, registry);
    });

    return withAutoSettings(nodes, edges, settingValues, layout, registry);
}
