import { v4 as uuidv4 } from "uuid";
import type { Edge } from "@xyflow/react";
import type { AppNode } from "../types/app-node";
import { TaskType, type TaskParam, type TaskSpecRegistry } from "../types/task";
import { EdgeType, HandleId, settingSourceHandle } from "../types/edge";
import { getConfigInputs } from "./task-utils";
import { TASK_SPECS } from "./task-specs";
import { type LayoutStrategy, DEFAULT_LAYOUT } from "../layout";

declare const process: { env: { NODE_ENV?: string } };

type Position = { x: number; y: number };

/** Node type key registered in ReactFlow `nodeTypes` for every workflow node. */
export const WORKFLOW_NODE_TYPE = "GenNode";

/** A chain node with a random id (builder "add node"). */
export function CreateFlowNode(nodeType: TaskType, position?: Position, deletable?: boolean): AppNode {
    return { ...makeFlowNode(uuidv4(), nodeType, position?.x ?? 0, position?.y ?? 0), deletable: deletable ?? true };
}

/** A chain node with a known id (presets, pipelines). Not deletable from the keyboard: see handleRemoveChainNode. */
export function makeFlowNode(id: string, type: TaskType, x: number, y: number): AppNode {
    return {
        id,
        type: WORKFLOW_NODE_TYPE,
        dragHandle: ".drag-handle",
        data: { type, inputs: {}, outputs: [] },
        position: { x, y },
        deletable: false,
    };
}

/** Main-chain edge `source → target`. */
export function linkNodes(sourceNode: string, targetNode: string) {
    return {
        id: `${sourceNode}-to-${targetNode}`,
        source: sourceNode,
        target: targetNode,
        sourceHandle: HandleId.MainSource,
        targetHandle: HandleId.MainTarget,
        animated: true,
        type: EdgeType.Main,
    };
}

/** The MODEL / INSTRUCTION node of `input`, next to its parent; `value` fills it, otherwise it is a placeholder. */
function makeSettingNode(parent: AppNode, input: TaskParam, position: Position, value?: string): AppNode {
    const data: AppNode["data"] = {
        type: input.nodeType,
        inputs: {},
        outputs: [],
        isPlaceholder: value === undefined,
        configItems: input.items || [],
        settingLabel: input.name,
        inputType: input.type,
        parentNodeId: parent.id,
    };
    if (value !== undefined) {
        Object.assign(data, { firstTime: false, isEditing: false, modelName: value, stringValue: value });
    }
    return { id: uuidv4(), type: WORKFLOW_NODE_TYPE, dragHandle: ".drag-handle", data, deletable: true, position };
}

function makeSettingEdge(parent: AppNode, input: TaskParam, settingNodeId: string): Edge {
    return {
        id: `${parent.id}-setting-${input.name}`,
        source: parent.id,
        target: settingNodeId,
        sourceHandle: settingSourceHandle(input.name),
        targetHandle: HandleId.SettingTarget,
        type: EdgeType.Settings,
        animated: false,
        data: { label: input.name },
    };
}

const offsetFrom = (parent: AppNode, offset: Position): Position => ({
    x: parent.position.x + offset.x,
    y: parent.position.y + offset.y,
});

export function createSettingPlaceholders(
    parentNode: AppNode,
    configInputs: TaskParam[],
    layout: LayoutStrategy = DEFAULT_LAYOUT,
    startIndex: number = 0,
    totalCount: number = configInputs.length,
): { nodes: AppNode[]; edges: Edge[] } {
    const nodes = configInputs.map((input, index) =>
        makeSettingNode(parentNode, input, offsetFrom(parentNode, layout.getSettingOffset(startIndex + index, totalCount))),
    );
    const edges = configInputs.map((input, index) => makeSettingEdge(parentNode, input, nodes[index].id));
    return { nodes, edges };
}

/**
 * Adds the missing setting nodes of every chain node: filled from `settingValues[nodeId][inputName]`
 * when given, placeholders otherwise. Settings already connected are left untouched.
 */
export function withAutoSettings(
    nodes: AppNode[],
    edges: Edge[],
    settingValues?: Record<string, Record<string, string>>,
    layout: LayoutStrategy = DEFAULT_LAYOUT,
    registry: TaskSpecRegistry = TASK_SPECS,
): { nodes: AppNode[]; edges: Edge[] } {
    const extraNodes: AppNode[] = [];
    const extraEdges: Edge[] = [];

    nodes.forEach((node) => {
        const cfgInputs = getConfigInputs(node.data.type, registry);
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
                (e) => e.source === node.id && e.sourceHandle === settingSourceHandle(input.name),
            );
            if (alreadyConnected) return;
            const value = settingValues?.[node.id]?.[input.name];
            const settingNode = makeSettingNode(node, input, offsetFrom(node, layout.getSettingOffset(index, total)), value);
            extraNodes.push(settingNode);
            extraEdges.push(makeSettingEdge(node, input, settingNode.id));
        });
    });

    return {
        nodes: [...nodes, ...extraNodes],
        edges: [...edges, ...extraEdges],
    };
}
