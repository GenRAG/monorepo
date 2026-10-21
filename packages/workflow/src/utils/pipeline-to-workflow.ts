import type { Edge } from "@xyflow/react";
import type { AppNode } from "../types/app-node";
import type { PipelineBlock } from "../types/pipeline";
import { TaskType, type TaskSpecRegistry } from "../types/task";
import { createMultipleSettingNode, linkNodes, makeFlowNode, withAutoSettings } from "../graph/create-flow-node";
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

/** The values a chain node gives its single-valued settings. `null` / absent: not chosen yet (placeholder). */
export interface ChainSettingValues {
    model?: string | null;
    instruction?: string | null;
}

/** A chain node to draw, in chain order. */
export interface ChainEntry {
    /** Node id, made unique when several entries share it. */
    name: string;
    type: TaskType;
    settings: ChainSettingValues;
    /** One DATASET setting node each (RETRIEVER). */
    datasetIds?: readonly string[];
}

/** Setting values keyed by the input names of the task (the first MODEL / INSTRUCTION input). */
function settingValuesByInput(type: TaskType, settings: ChainSettingValues, registry: TaskSpecRegistry): Record<string, string> {
    const inputs = registry[type]?.inputs ?? [];
    const values: Record<string, string> = {};
    const modelInput = inputs.find((i) => i.nodeType === TaskType.MODEL);
    const instructionInput = inputs.find((i) => i.nodeType === TaskType.INSTRUCTION);
    if (settings.model != null && modelInput) values[modelInput.name] = settings.model;
    if (settings.instruction && instructionInput) values[instructionInput.name] = settings.instruction;
    return values;
}

/**
 * Draws a chain: one chain node per entry, linked in order and placed by the layout, with its MODEL / INSTRUCTION
 * settings filled from the entry (placeholders when missing) and one DATASET node per dataset.
 */
export function chainToWorkflow(
    entries: readonly ChainEntry[],
    options: PipelineToWorkflowOptions = {},
): { nodes: AppNode[]; edges: Edge[] } {
    const layout = options.layout ?? DEFAULT_LAYOUT;
    const registry = options.registry ?? TASK_SPECS;
    const nodes: AppNode[] = [];
    const edges: Edge[] = [];
    const settingValues: Record<string, Record<string, string>> = {};
    const usedIds = new Set<string>();
    const datasetIdsByNode: Record<string, string[]> = {};

    for (const entry of entries) {
        let id = entry.name;
        for (let n = 2; usedIds.has(id); n += 1) id = `${entry.name}-${n}`;
        usedIds.add(id);

        const previous = nodes[nodes.length - 1];
        const node = makeFlowNode(id, entry.type, 0, 0);
        nodes.push(node);
        if (previous) edges.push(linkNodes(previous.id, id));
        node.position = layout.computePlacements(nodes, edges, id)[0]?.position ?? layout.getInitialPosition();

        settingValues[id] = settingValuesByInput(entry.type, entry.settings, registry);
        if (entry.datasetIds?.length) datasetIdsByNode[id] = [...new Set(entry.datasetIds)];
    }

    const graph = withAutoSettings(nodes, edges, settingValues, layout, registry);

    // One DATASET node per dataset, after the single-valued settings.
    for (const [nodeId, datasetIds] of Object.entries(datasetIdsByNode)) {
        const parent = graph.nodes.find((n) => n.id === nodeId)!;
        const input = registry[parent.data.type]?.inputs.find((i) => i.nodeType === TaskType.DATASET);
        if (!input) continue;
        datasetIds.forEach((datasetId, index) => {
            const { node, edge } = createMultipleSettingNode(parent, input, datasetId, index, layout);
            graph.nodes.push(node);
            graph.edges.push(edge);
        });
    }

    return graph;
}

/**
 * Rebuilds the builder graph from a RAG pipeline (`definition.blocks`, the format sent to the engine):
 * one chain node per block, linked in order, with its MODEL / INSTRUCTION settings filled from the block
 * (placeholders when missing). Node ids are the block names (suffixed when repeated).
 *
 * Inverse of `serializeWorkflow` for the settings the builder exposes: `collection_name` and `top_k` of a
 * retrieve block have no node and are not kept; its `datasetIds` become DATASET nodes.
 *
 * @throws UnsupportedPipelineBlockError on a block type the builder does not know.
 */
export function pipelineToWorkflow(
    blocks: readonly PipelineBlock[],
    options: PipelineToWorkflowOptions = {},
): { nodes: AppNode[]; edges: Edge[] } {
    const entries = blocks.map((block, index): ChainEntry => {
        const type = TASK_TYPE_BY_BLOCK[block?.type];
        if (!type) throw new UnsupportedPipelineBlockError(block?.type, index);
        return {
            name: block.name || block.type,
            type,
            settings: {
                model: "model" in block ? block.model : undefined,
                instruction: "system_prompt" in block ? block.system_prompt : undefined,
            },
            datasetIds: block.type === "retrieve" ? block.datasetIds : undefined,
        };
    });
    return chainToWorkflow(entries, options);
}
