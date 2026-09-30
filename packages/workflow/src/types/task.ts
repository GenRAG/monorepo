import type { ComponentType } from "react";
import type { ModelOption } from "./model-option";
import type { WorkflowNodeProps } from "./app-node";

export enum TaskType {
    QUERY = "QUERY",
    REWRITER = "REWRITER",
    RETRIEVER = "RETRIEVER",
    RERANKER = "RERANKER",
    RESPONSE = "RESPONSE",
    MODEL = "MODEL",
    INSTRUCTION = "INSTRUCTION",
}

export enum TaskParamType {
    SELECT = "SELECT",
    STRING = "STRING",
    NUMBER = "NUMBER",
    NODE = "NODE", // chain connection (main nodes)
    SETTINGS = "SETTINGS", // setting placeholder (Model, Instruction…)
}

/** A setting of a chain task, rendered as a separate MODEL / INSTRUCTION node linked by a settings edge. */
export interface TaskSettingParam {
    name: string;
    type: TaskParamType;
    nodeType: TaskType;
    helperText?: string;
    required?: boolean;
    hideHandle?: boolean;
    items?: ModelOption[];
}

export type TaskParam = TaskSettingParam;

export interface TaskChainOutput {
    nodeType: TaskType;
    optional: boolean;
}

/** What a task is and how it chains: pure data, no React (usable from `@genrag/workflow/core`). */
export interface TaskSpec {
    type: TaskType;
    label: string;
    description: string;
    isEntryPoint: boolean;
    isEndPoint: boolean;
    isDeletable: boolean;
    inputs: TaskSettingParam[];
    chainOutputs?: TaskChainOutput[];
}

/** A task spec plus how the builder draws it. */
export interface Task extends TaskSpec {
    icon: ComponentType<{ size?: number | string }>;
    /** Custom node renderer (settings nodes); chain tasks use the default NodeComponent. */
    component?: ComponentType<WorkflowNodeProps>;
}

export type TaskSpecRegistry = Record<TaskType, TaskSpec>;
export type WorkflowRegistry = Record<TaskType, Task>;
