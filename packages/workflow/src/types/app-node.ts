import type { ComponentType } from "react";
import { Node, NodeProps } from "@xyflow/react";
import { TaskType, TaskParamType, TaskParam } from "./task";
import type { ModelOption } from "./model-option";

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
    isVertical?: boolean;
};

export type NodeComponentType = ComponentType<WorkflowNodeProps>;
