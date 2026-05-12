import { v4 as uuidv4 } from "uuid";
import { AppNode } from "../types/app-node";
import { TaskType, TaskParam } from "../types/task";
import { EdgeType } from "../types/edge";
import { Edge } from "@xyflow/react";
import { getConfigInputs } from "./task-utils";
import { type LayoutStrategy, DEFAULT_LAYOUT } from "../layout";

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
        type: EdgeType.Main,
    };
}

export function createSettingPlaceholders(
    parentNode: AppNode,
    configInputs: TaskParam[],
    layout: LayoutStrategy = DEFAULT_LAYOUT,
    startIndex: number = 0,
    totalCount: number = configInputs.length,
): { nodes: AppNode[]; edges: Edge[] } {
    const nodes: AppNode[] = [];
    const edges: Edge[] = [];

    configInputs.forEach((input, index) => {
        const placeholderId = uuidv4();
        const offset = layout.getSettingOffset(startIndex + index, totalCount);

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
                x: parentNode.position.x + offset.x,
                y: parentNode.position.y + offset.y,
            },
        });

        edges.push({
            id: `${parentNode.id}-setting-${input.name}`,
            source: parentNode.id,
            target: placeholderId,
            sourceHandle: `setting-source-${input.name}`,
            targetHandle: "setting-target",
            type: EdgeType.Settings,
            animated: false,
            data: { label: input.name },
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
    layout: LayoutStrategy = DEFAULT_LAYOUT,
): { nodes: AppNode[]; edges: Edge[] } {
    const extraNodes: AppNode[] = [];
    const extraEdges: Edge[] = [];

    nodes.forEach((node) => {
        const cfgInputs = getConfigInputs(node.data.type);
        const total = cfgInputs.length;

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

        cfgInputs.forEach((input, index) => {
            const alreadyConnected = edges.some(
                (e) =>
                    e.source === node.id &&
                    e.sourceHandle === `setting-source-${input.name}`,
            );
            if (alreadyConnected) return;
            const value = settingValues?.[node.id]?.[input.name];
            const offset = layout.getSettingOffset(index, total);
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
                        x: node.position.x + offset.x,
                        y: node.position.y + offset.y,
                    },
                });
                extraEdges.push({
                    id: `${node.id}-setting-${input.name}`,
                    source: node.id,
                    target: settingId,
                    sourceHandle: `setting-source-${input.name}`,
                    targetHandle: "setting-target",
                    type: EdgeType.Settings,
                    animated: false,
                    data: { label: input.name },
                });
            } else {
                const { nodes: pn, edges: pe } = createSettingPlaceholders(node, [input], layout, index, total);
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

