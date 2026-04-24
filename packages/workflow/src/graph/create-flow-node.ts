import { v4 as uuidv4 } from "uuid";
import { AppNode } from "../types/app-node";
import { TaskType, TaskParam, TaskChainOutput } from "../types/task";
import { TaskRegistry as LegacyTaskRegistry } from "./task/registry";
import { Edge } from "@xyflow/react";
import { getConfigInputs } from "./task-utils";

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
        cfgInputs.forEach((input) => {
            const alreadyConnected = edges.some(
                (e) =>
                    e.source === node.id &&
                    e.sourceHandle === `setting-source-${input.name}`,
            );
            if (alreadyConnected) return;
            console.log(settingValues)
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
