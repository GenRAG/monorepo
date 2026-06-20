import type { ComponentType } from "react";
import { Node, NodeProps } from "@xyflow/react";
import { TaskType, TaskParamType, TaskParam } from "./task";
import type { ModelOption } from "./model-option";

/**
 * AppNodeData is intentionally a flat union of all node-type-specific fields.
 * ReactFlow requires TData to be consistent across all nodes in a flow,
 * making discriminated unions impractical here.
 *
 * Convention:
 * - Fields used by all nodes: type, inputs, outputs
 * - Fields for settings nodes only: isPlaceholder, settingLabel, parentNodeId,
 *   configItems, inputType, firstTime
 * - Fields for MODEL nodes only: modelName
 * - Fields for INSTRUCTION nodes only: stringValue, isEditing
 *
 * When adding a new settings node type, add its fields here with a comment
 * indicating which node type owns them. Do NOT add fields to the top-level
 * for data that could live in inputs[].
 */
export interface AppNodeData extends Record<string, unknown> {
    type: TaskType;
    inputs: Record<string, string>;
    outputs: string[];
    isPlaceholder?: boolean;
    isEditing?: boolean;
    firstTime?: boolean;
    modelName?: string;
    stringValue?: string;
    settingLabel?: string;
    parentNodeId?: string;
    configItems?: ModelOption[];
    inputType?: TaskParamType;
}

export interface AppNode extends Node {
    data: AppNodeData;
}

export interface ParamProps {
    param: TaskParam;
    value: string;
    updateNodeParamValue: (value: string) => void;
}

export type WorkflowNodeProps = NodeProps & {
    onNodeClick?: (nodeId: string) => void;
    onRemoveNode?: (nodeId: string) => Promise<void> | void;
    onInstructionSave?: (nodeId: string) => void;
    onMutation?: () => void;
    isVertical?: boolean;
};

export type NodeComponentType = ComponentType<WorkflowNodeProps>;
