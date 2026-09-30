import type { Edge } from "@xyflow/react";
import { linkNodes, makeFlowNode, withAutoSettings } from "../src/graph/create-flow-node";
import type { AppNode } from "../src/types/app-node";
import { TaskType } from "../src/types/task";

/** Full chain (QUERY → REWRITER → RETRIEVER → RERANKER → RESPONSE), every setting filled. */
export function fullWorkflow(): { nodes: AppNode[]; edges: Edge[] } {
    return withAutoSettings(
        [
            makeFlowNode("q", TaskType.QUERY, 0, 0),
            makeFlowNode("w", TaskType.REWRITER, 0, 140),
            makeFlowNode("r", TaskType.RETRIEVER, 0, 280),
            makeFlowNode("k", TaskType.RERANKER, 0, 420),
            makeFlowNode("s", TaskType.RESPONSE, 0, 560),
        ],
        [linkNodes("q", "w"), linkNodes("w", "r"), linkNodes("r", "k"), linkNodes("k", "s")],
        {
            w: { "Modèle de reformulation": "mistral" },
            k: { "Modèle de tri": "colbert" },
            s: { "Modèle IA": "google/gemini-2.5-flash", Instruction: "Réponds en français." },
        },
    );
}

/** Minimal chain (QUERY → RETRIEVER → RESPONSE), settings left as placeholders. */
export function minimalWorkflow(): { nodes: AppNode[]; edges: Edge[] } {
    return withAutoSettings(
        [
            makeFlowNode("q", TaskType.QUERY, 0, 0),
            makeFlowNode("r", TaskType.RETRIEVER, 0, 140),
            makeFlowNode("s", TaskType.RESPONSE, 0, 280),
        ],
        [linkNodes("q", "r"), linkNodes("r", "s")],
    );
}

export const settingNodesOf = (nodes: AppNode[], parentId: string) =>
    nodes.filter((n) => n.data.parentNodeId === parentId);
