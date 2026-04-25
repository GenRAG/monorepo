import { v4 as uuidv4 } from "uuid";
import { AppNode } from "../types/app-node";
import { TaskType, TaskParam, TaskChainOutput } from "../types/task";
import { TaskRegistry as LegacyTaskRegistry } from "./task/registry";
import { Edge } from "@xyflow/react";
import { getConfigInputs } from "./task-utils";

declare const process: { env: { NODE_ENV?: string } };

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

export function createChainOutputPlaceholders(
    parentNode: AppNode,
    chainOutputs: TaskChainOutput[],
): { nodes: AppNode[]; edges: Edge[] } {
    const nodes: AppNode[] = [];
    const edges: Edge[] = [];

    chainOutputs.forEach((output) => {
        const taskDef = LegacyTaskRegistry[output.nodeType];
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
                isPlaceholder: true,
                isChainPlaceholder: true,
                parentNodeId: parentNode.id,
            },
            deletable: output.optional,
            position: {
                x: parentNode.position.x + output.position.x,
                y: parentNode.position.y + output.position.y,
            },
        });

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

export function makeFlowNode(id: string, type: TaskType, x: number, y: number): AppNode {
    return {
        id,
        type: "GenNode",
        dragHandle: ".drag-handle",
        data: { type, inputs: {}, outputs: [] },
        position: { x, y },
        deletable: false,
    };
}

export function withAutoSettings(
    nodes: AppNode[],
    edges: Edge[],
    settingValues?: Record<string, Record<string, string>>,
): { nodes: AppNode[]; edges: Edge[] } {
    const extraNodes: AppNode[] = [];
    const extraEdges: Edge[] = [];

    nodes.forEach((node) => {
        const cfgInputs = getConfigInputs(node.data.type);

        if (process.env.NODE_ENV !== "production" && settingValues?.[node.id]) {
            const validNames = new Set(cfgInputs.map((i) => i.name));
            for (const key of Object.keys(settingValues[node.id])) {
                if (!validNames.has(key)) {
                    console.warn(
                        `[withAutoSettings] Node "${node.id}" (${node.data.type}): ` +
                        `unrecognized setting key "${key}". ` +
                        `Valid keys: ${Array.from(validNames).map((n) => `"${n}"`).join(", ") || "(none)"}`,
                    );
                }
            }
        }

        cfgInputs.forEach((input) => {
            const alreadyConnected = edges.some(
                (e) =>
                    e.source === node.id &&
                    e.sourceHandle === `setting-source-${input.name}`,
            );
            if (alreadyConnected) return;
            const value = settingValues?.[node.id]?.[input.name];
            if (value !== undefined) {
                const settingId = uuidv4();
                extraNodes.push({
                    id: settingId,
                    type: "GenNode",
                    dragHandle: ".drag-handle",
                    data: {
                        type: input.nodeType,
                        inputs: {},
                        outputs: [],
                        isPlaceholder: false,
                        firstTime: false,
                        isEditing: false,
                        configItems: input.items || [],
                        settingLabel: input.name,
                        inputType: input.type,
                        parentNodeId: node.id,
                        modelName: value,
                        stringValue: value,
                    },
                    deletable: true,
                    position: {
                        x: node.position.x + input.position.x,
                        y: node.position.y + input.position.y,
                    },
                });
                extraEdges.push({
                    id: `${node.id}-setting-${input.name}`,
                    source: node.id,
                    target: settingId,
                    sourceHandle: `setting-source-${input.name}`,
                    targetHandle: "setting-target",
                    type: "settings",
                    animated: false,
                    data: { label: input.name },
                });
            } else {
                const { nodes: pn, edges: pe } = createSettingPlaceholders(node, [input]);
                extraNodes.push(...pn);
                extraEdges.push(...pe);
            }
        });
    });

    return {
        nodes: [...nodes, ...extraNodes],
        edges: [...edges, ...extraEdges],
    };
}

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
        if (edge.type !== "settings" || !edge.sourceHandle) return [edge];

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
