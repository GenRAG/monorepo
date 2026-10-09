import { v4 as uuidv4 } from "uuid";
import type { Edge } from "@xyflow/react";
import type { AppNode } from "../types/app-node";
import { TaskType, type TaskParam, type TaskSpecRegistry } from "../types/task";
import { EdgeType, HandleId, settingSourceHandle } from "../types/edge";
import { getAutoSettingInputs, getConfigInputs } from "./task-utils";
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

/** Input key holding the dataset id of a DATASET setting node. */
export const DATASET_ID_INPUT = "datasetId";

/** The setting node of `input`, next to its parent; `value` fills it, otherwise it is a placeholder. */
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
    if (value !== undefined && input.nodeType === TaskType.DATASET) {
        data.inputs = { [DATASET_ID_INPUT]: value };
    } else if (value !== undefined) {
        Object.assign(data, { firstTime: false, isEditing: false, modelName: value, stringValue: value });
    }
    return { id: uuidv4(), type: WORKFLOW_NODE_TYPE, dragHandle: ".drag-handle", data, deletable: true, position };
}

/** Settings edge id: one per input, or one per setting node for `multiple` inputs. */
export const settingEdgeId = (parentId: string, input: Pick<TaskParam, "name" | "multiple">, settingNodeId: string) =>
    input.multiple ? `${parentId}-setting-${input.name}-${settingNodeId}` : `${parentId}-setting-${input.name}`;

function makeSettingEdge(parent: AppNode, input: TaskParam, settingNodeId: string): Edge {
    return {
        id: settingEdgeId(parent.id, input, settingNodeId),
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
    allConfigInputs: TaskParam[],
    layout: LayoutStrategy = DEFAULT_LAYOUT,
    startIndex: number = 0,
    totalCount?: number,
): { nodes: AppNode[]; edges: Edge[] } {
    const configInputs = allConfigInputs.filter((input) => !input.multiple);
    const total = totalCount ?? configInputs.length;
    const nodes = configInputs.map((input, index) =>
        makeSettingNode(parentNode, input, offsetFrom(parentNode, layout.getSettingOffset(startIndex + index, total))),
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
        const cfgInputs = getAutoSettingInputs(node.data.type, registry);
        const total = cfgInputs.length;

        if (process.env.NODE_ENV !== "production" && settingValues?.[node.id]) {
            const validNames = new Set(getConfigInputs(node.data.type, registry).map((i) => i.name));
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

/**
 * One more setting node on a `multiple` input (e.g. a DATASET of the RETRIEVER), placed after the settings already
 * hanging off the parent.
 */
export function createMultipleSettingNode(
    parent: AppNode,
    input: TaskParam,
    value: string,
    existingCount: number,
    layout: LayoutStrategy = DEFAULT_LAYOUT,
): { node: AppNode; edge: Edge } {
    const offset = layout.getSettingOffset(existingCount, existingCount + 1);
    const node = makeSettingNode(parent, input, offsetFrom(parent, offset), value);
    return { node, edge: makeSettingEdge(parent, input, node.id) };
}
