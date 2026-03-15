import { v4 as uuidv4 } from "uuid";
import { AppNode } from "../types/app-node";
import { TaskType, TaskParam, TaskChainOutput } from "../types/task";
import { TaskRegistry } from "./task/registry";
import { Edge } from "@xyflow/react";

export function CreateFlowNode(
    nodeType: TaskType,
    position?: { x: number; y: number },
    targetNodeId?: string,
    deletable?: boolean,
): { node: AppNode; edge?: Edge } {
    const newNode: AppNode = {
        id: uuidv4(),
        type: "GenNode",
        dragHandle: ".drag-handle",
        data: {
            type: nodeType,
            inputs: {},
            outputs: [],
        },
        deletable: deletable ?? true,
        position: position ?? { x: 0, y: 0 },
    };

    const newEdge = targetNodeId
        ? {
              id: `${newNode.id}-to-${targetNodeId}`,
              source: newNode.id,
              target: targetNodeId,
              animated: true,
          }
        : undefined;

    return { node: newNode, edge: newEdge };
}

// ── linkNodes — inchangé ───────────────────────────────────────────────────────
export function linkNodes(sourceNode: string, targetNode: string) {
    return {
        id: `${sourceNode}-to-${targetNode}`,
        source: sourceNode,
        target: targetNode,
        sourceHandle: "main-source",
        targetHandle: "main-target",
        animated: true,
    };
}

// ── createSettingPlaceholders — inchangé ──────────────────────────────────────
export function createSettingPlaceholders(
    parentNode: AppNode,
    configInputs: TaskParam[],
): { nodes: AppNode[]; edges: Edge[] } {
    const nodes: AppNode[] = [];
    const edges: Edge[] = [];

    configInputs.forEach((input) => {
        const placeholderId = uuidv4();

        nodes.push({
            id: placeholderId,
            type: "GenNode",
            dragHandle: ".drag-handle",
            data: {
                type: input.nodeType,
                inputs: {},
                outputs: [],
                isPlaceholder: true,
                configItems: input.items || [],
                settingLabel: input.name,
                inputType: input.type,
                parentNodeId: parentNode.id,
            },
            deletable: true,
            position: {
                x: parentNode.position.x + input.position.x,
                y: parentNode.position.y + input.position.y,
            },
        });

        edges.push({
            id: `${parentNode.id}-setting-${input.name}`,
            source: parentNode.id,
            target: placeholderId,
            sourceHandle: `setting-source-${input.name}`,
            targetHandle: "setting-target",
            type: "settings",
            animated: false,
            data: { label: input.name },
        });
    });

    return { nodes, edges };
}

// ── createChainOutputPlaceholders — NOUVEAU ────────────────────────────────────
// Crée des placeholders pour les nodes optionnels de la chaîne principale.
// Contrairement aux settings, ces nodes sont des vrais nodes de la chaîne
// qui s'insèrent entre deux nodes existants.
export function createChainOutputPlaceholders(
    parentNode: AppNode,
    chainOutputs: TaskChainOutput[],
): { nodes: AppNode[]; edges: Edge[] } {
    const nodes: AppNode[] = [];
    const edges: Edge[] = [];

    chainOutputs.forEach((output) => {
        // On récupère les infos depuis le TaskRegistry — pas de duplication
        const taskDef = TaskRegistry[output.nodeType];
        if (!taskDef) return;

        const placeholderId = uuidv4();

        nodes.push({
            id: placeholderId,
            type: "GenNode",
            dragHandle: ".drag-handle",
            data: {
                type: output.nodeType,
                inputs: {},
                outputs: [],
                isPlaceholder: true, // commence en placeholder "+"
                isChainPlaceholder: true, // distingue des settings placeholders
                parentNodeId: parentNode.id,
            },
            deletable: output.optional, // supprimable seulement si optionnel
            position: {
                x: parentNode.position.x + output.position.x,
                y: parentNode.position.y + output.position.y,
            },
        });

        // Edge de la chaîne principale (pas settings)
        edges.push({
            id: `${parentNode.id}-chain-${output.nodeType}`,
            source: parentNode.id,
            target: placeholderId,
            sourceHandle: "main-source",
            targetHandle: "main-target",
            animated: true,
            type: "default",
            data: { label: taskDef.label, optional: output.optional },
        });
    });

    return { nodes, edges };
}
