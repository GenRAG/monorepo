import { Edge, Node } from "@xyflow/react";
import { TaskType } from "./task";
import { TaskParam } from "./task";

export interface AppNodeData {
    type: TaskType;
    inputs: Record<string, string>;
    outputs: string[];
    [key: string]: any;
}

export interface AppNode extends Node {
    data: AppNodeData;
}

export interface ParamProps {
    param: TaskParam;
    value: string;
    updateNodeParamValue: (value: string) => void;
}
