import type { Edge } from "@xyflow/react";
import type { AppNode } from "../types/app-node";
import { TaskType } from "../types/task";

export interface PipelineBlock {
    name: string;
    type: string;
    model?: string;
    collection_name?: string;
    top_k?: number;
    system_prompt?: string;
}

export interface WorkflowDefinition {
    nodes: AppNode[];
    edges: Edge[];
    blocks: PipelineBlock[];
}

export function serializeWorkflow(
    nodes: AppNode[],
    edges: Edge[],
): WorkflowDefinition {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const settingsMap = new Map<
        string,
        { model?: string; instruction?: string }
    >();

    edges
        .filter((e) => e.type === "settings")
        .forEach((e) => {
            const settingsNode = nodeMap.get(e.target);
            if (!settingsNode) return;
            const current = settingsMap.get(e.source) ?? {};
            if (settingsNode.data.type === TaskType.MODEL) {
                settingsMap.set(e.source, {
                    ...current,
                    model: settingsNode.data.modelName as string | undefined,
                });
            } else if (settingsNode.data.type === TaskType.INSTRUCTION) {
                settingsMap.set(e.source, {
                    ...current,
                    instruction: settingsNode.data.stringValue as string | undefined,
                });
            }
        });

    const mainEdges = edges.filter((e) => e.type !== "settings");
    const entryNode = nodes.find((n) => n.data.type === TaskType.QUERY);
    const orderedNodes: AppNode[] = [];

    if (entryNode) {
        let current: AppNode | undefined = entryNode;
        const visited = new Set<string>();
        while (current && !visited.has(current.id)) {
            visited.add(current.id);
            if (
                current.data.type !== TaskType.MODEL &&
                current.data.type !== TaskType.INSTRUCTION
            ) {
                orderedNodes.push(current);
            }
            const nextEdge = mainEdges.find(
                (e) =>
                    e.source === current!.id &&
                    e.sourceHandle === "main-source",
            );
            current = nextEdge ? nodeMap.get(nextEdge.target) : undefined;
        }
    }

    const blocks: PipelineBlock[] = orderedNodes
        .map((node): PipelineBlock | null => {
            const s = settingsMap.get(node.id) ?? {};
            switch (node.data.type) {
                case TaskType.QUERY:
                    return { name: "query", type: "query" };
                case TaskType.REWRITER:
                    return {
                        name: "rewrite",
                        type: "rewrite",
                        model: s.model ?? "gpt-4o",
                    };
                case TaskType.RETRIEVER:
                    return {
                        name: "retrieve",
                        type: "retrieve",
                        collection_name: "genrag_knowledge_base",
                        top_k: 5,
                    };
                case TaskType.RERANKER:
                    return {
                        name: "rerank",
                        type: "rerank",
                        model: s.model ?? "bge",
                    };
                case TaskType.RESPONSE:
                    return {
                        name: "answer",
                        type: "answer",
                        model: s.model ?? "gpt-4o",
                        ...(s.instruction
                            ? { system_prompt: s.instruction }
                            : {}),
                    };
                default:
                    return null;
            }
        })
        .filter((b): b is PipelineBlock => b !== null);

    return { nodes, edges, blocks };
}
