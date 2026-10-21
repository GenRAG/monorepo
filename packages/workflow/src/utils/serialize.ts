import type { Edge } from "@xyflow/react";
import type { AppNode } from "../types/app-node";
import { TaskType } from "../types/task";
import { EdgeType, HandleId } from "../types/edge";
import type { PipelineBlock, WorkflowDefinition } from "../types/pipeline";
import { isSettingsTaskType } from "../graph/task-utils";
import { SETTING_KINDS } from "../graph/setting-kinds";

// Placeholder MODEL settings fall back to these models (the builder warns before saving an incomplete workflow).
const DEFAULT_MODELS = { rewrite: 'gpt-4o', rerank: 'bge', answer: 'gpt-4o' } as const;
const COLLECTION_NAME = 'genrag_knowledge_base';
const DEFAULT_TOP_K = 5;

/** The settings a chain node gives its block. Missing models fall back to `DEFAULT_MODELS`. */
export type BlockSettings = { model?: string; instruction?: string; datasetIds?: string[] };
type BlockFactory = (s: BlockSettings) => PipelineBlock;

const BLOCK_FACTORIES: Partial<Record<TaskType, BlockFactory>> = {
    [TaskType.QUERY]:     ()  => ({ name: 'query',    type: 'query' }),
    [TaskType.REWRITER]:  (s) => ({ name: 'rewrite',  type: 'query_rewrite', model: s.model ?? DEFAULT_MODELS.rewrite }),
    [TaskType.RETRIEVER]: (s) => ({ name: 'retrieve', type: 'retrieve', collection_name: COLLECTION_NAME, top_k: DEFAULT_TOP_K, datasetIds: s.datasetIds ?? [] }),
    [TaskType.RERANKER]:  (s) => ({ name: 'rerank',   type: 'rerank',   model: s.model ?? DEFAULT_MODELS.rerank }),
    [TaskType.RESPONSE]:  (s) => ({ name: 'answer',   type: 'answer',   model: s.model ?? DEFAULT_MODELS.answer, system_prompt: s.instruction }),
};

/** The engine block of a chain task (`undefined` for a settings task). Shared by every pipeline model. */
export function blockFor(type: TaskType, settings: BlockSettings): PipelineBlock | undefined {
    return BLOCK_FACTORIES[type]?.(settings);
}

function buildSettingsMap(nodes: AppNode[], edges: Edge[]): Map<string, BlockSettings> {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const settingsMap = new Map<string, BlockSettings>();

    edges
        .filter((e) => e.type === EdgeType.Settings)
        .forEach((e) => {
            const settingsNode = nodeMap.get(e.target);
            if (!settingsNode) return;
            const current = settingsMap.get(e.source) ?? {};
            const value = SETTING_KINDS[settingsNode.data.type]?.read(settingsNode.data);
            if (settingsNode.data.type === TaskType.MODEL) {
                settingsMap.set(e.source, { ...current, model: value });
            } else if (settingsNode.data.type === TaskType.INSTRUCTION) {
                settingsMap.set(e.source, { ...current, instruction: value });
            } else if (settingsNode.data.type === TaskType.DATASET) {
                const datasetId = value;
                if (!datasetId || current.datasetIds?.includes(datasetId)) return;
                settingsMap.set(e.source, { ...current, datasetIds: [...(current.datasetIds ?? []), datasetId] });
            }
        });

    return settingsMap;
}

function collectMainChainNodes(nodes: AppNode[], edges: Edge[]): AppNode[] {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const nextNodeMap = new Map(
        edges
            .filter((e) => e.type !== EdgeType.Settings && e.sourceHandle === HandleId.MainSource)
            .map((e) => [e.source, e.target]),
    );

    const orderedNodes: AppNode[] = [];
    let current = nodes.find((n) => n.data.type === TaskType.QUERY);
    const visited = new Set<string>();

    while (current && !visited.has(current.id)) {
        visited.add(current.id);
        if (!isSettingsTaskType(current.data.type)) {
            orderedNodes.push(current);
        }
        const nextId = nextNodeMap.get(current.id);
        current = nextId ? nodeMap.get(nextId) : undefined;
    }

    return orderedNodes;
}

export function serializeWorkflow(nodes: AppNode[], edges: Edge[]): WorkflowDefinition {
    const settingsMap = buildSettingsMap(nodes, edges);
    const orderedNodes = collectMainChainNodes(nodes, edges);

    const blocks = orderedNodes
        .map((node) => blockFor(node.data.type, settingsMap.get(node.id) ?? {}) ?? null)
        .filter((b): b is PipelineBlock => b !== null);

    return { nodes, edges, blocks };
}
