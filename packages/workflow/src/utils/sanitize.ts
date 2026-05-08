import type { AppNode } from "../types/app-node";
import type { Edge } from "@xyflow/react";
import { EdgeType } from "../types/edge";
import { getConfigInputs } from "../graph/task-utils";

/**
 * Repairs a workflow loaded from storage whose settings-edge sourceHandles no
 * longer match the current task-definition input names (e.g. after a rename).
 *
 * For each stale settings edge, the correct input is identified by matching the
 * target settings-node's type (MODEL / INSTRUCTION) against the source node's
 * current configInputs.  Nodes whose edges cannot be remapped are dropped.
 */
export function sanitizeWorkflowEdges(
    nodes: AppNode[],
    edges: Edge[],
): { nodes: AppNode[]; edges: Edge[] } {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const orphanedNodeIds = new Set<string>();

    const sanitizedEdges = edges.flatMap((edge) => {
        if (edge.type !== EdgeType.Settings || !edge.sourceHandle) return [edge];

        const sourceNode = nodeMap.get(edge.source);
        if (!sourceNode) {
            orphanedNodeIds.add(edge.target);
            return [];
        }

        const configInputs = getConfigInputs(sourceNode.data.type);
        const handleName = edge.sourceHandle.replace("setting-source-", "");

        if (configInputs.some((i) => i.name === handleName)) return [edge];

        // Stale handle — remap by matching the target settings node's nodeType
        const targetNode = nodeMap.get(edge.target);
        if (!targetNode) return [];

        const correctInput = configInputs.find(
            (i) => i.nodeType === targetNode.data.type,
        );
        if (!correctInput) {
            orphanedNodeIds.add(edge.target);
            return [];
        }

        // Patch the settings node so its label and configItems stay consistent
        nodeMap.set(targetNode.id, {
            ...targetNode,
            data: {
                ...targetNode.data,
                settingLabel: correctInput.name,
                configItems: correctInput.items ?? [],
            },
        });

        return [
            {
                ...edge,
                id: `${edge.source}-setting-${correctInput.name}`,
                sourceHandle: `setting-source-${correctInput.name}`,
                data: { ...edge.data, label: correctInput.name },
            },
        ];
    });

    const sanitizedNodes = Array.from(nodeMap.values()).filter(
        (n) => !orphanedNodeIds.has(n.id),
    );

    return { nodes: sanitizedNodes, edges: sanitizedEdges };
}
