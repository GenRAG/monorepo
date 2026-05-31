import type { Edge } from "@xyflow/react";
import type { AppNode } from "../types/app-node";
import { TaskType } from "../types/task";
import { EdgeType } from "../types/edge";

export type QueryBlock    = { name: string; type: 'query' };
export type RewriteBlock  = { name: string; type: 'query_rewrite'; model: string };
export type RetrieveBlock = { name: string; type: 'retrieve'; collection_name: string; top_k: number };
export type RerankBlock   = { name: string; type: 'rerank'; model: string };
export type AnswerBlock   = { name: string; type: 'answer'; model: string; system_prompt?: string };

export type PipelineBlock = QueryBlock | RewriteBlock | RetrieveBlock | RerankBlock | AnswerBlock;

export interface WorkflowDefinition {
    nodes: AppNode[];
    edges: Edge[];
    blocks: PipelineBlock[];
}

const DEFAULT_MODELS = { rewrite: 'gpt-4o', rerank: 'bge', answer: 'gpt-4o' } as const;
const COLLECTION_NAME = 'genrag_knowledge_base';
const DEFAULT_TOP_K = 5;

type NodeSettings = { model?: string; instruction?: string };
type BlockFactory = (s: NodeSettings) => PipelineBlock;

const BLOCK_FACTORIES: Partial<Record<TaskType, BlockFactory>> = {
    [TaskType.QUERY]:     ()  => ({ name: 'query',    type: 'query' }),
    [TaskType.REWRITER]:  (s) => ({ name: 'rewrite',  type: 'query_rewrite', model: s.model ?? DEFAULT_MODELS.rewrite }),
    [TaskType.RETRIEVER]: ()  => ({ name: 'retrieve', type: 'retrieve', collection_name: COLLECTION_NAME, top_k: DEFAULT_TOP_K }),
    [TaskType.RERANKER]:  (s) => ({ name: 'rerank',   type: 'rerank',   model: s.model ?? DEFAULT_MODELS.rerank }),
    [TaskType.RESPONSE]:  (s) => ({ name: 'answer',   type: 'answer',   model: s.model ?? DEFAULT_MODELS.answer, system_prompt: s.instruction }),
};

function buildSettingsMap(nodes: AppNode[], edges: Edge[]): Map<string, NodeSettings> {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const settingsMap = new Map<string, NodeSettings>();

    edges
        .filter((e) => e.type === EdgeType.Settings)
        .forEach((e) => {
            const settingsNode = nodeMap.get(e.target);
            if (!settingsNode) return;
            const current = settingsMap.get(e.source) ?? {};
            if (settingsNode.data.type === TaskType.MODEL) {
                settingsMap.set(e.source, { ...current, model: settingsNode.data.modelName as string | undefined });
            } else if (settingsNode.data.type === TaskType.INSTRUCTION) {
                settingsMap.set(e.source, { ...current, instruction: settingsNode.data.stringValue as string | undefined });
            }
        });

    return settingsMap;
}

function collectMainChainNodes(nodes: AppNode[], edges: Edge[]): AppNode[] {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const nextNodeMap = new Map(
        edges
            .filter((e) => e.type !== EdgeType.Settings && e.sourceHandle === 'main-source')
            .map((e) => [e.source, e.target]),
    );

    const orderedNodes: AppNode[] = [];
    let current = nodes.find((n) => n.data.type === TaskType.QUERY);
    const visited = new Set<string>();

    while (current && !visited.has(current.id)) {
        visited.add(current.id);
        if (current.data.type !== TaskType.MODEL && current.data.type !== TaskType.INSTRUCTION) {
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
        .map((node) => BLOCK_FACTORIES[node.data.type]?.(settingsMap.get(node.id) ?? {}) ?? null)
        .filter((b): b is PipelineBlock => b !== null);

    return { nodes, edges, blocks };
}
