import { Position } from "@xyflow/react";
import { ShapeType } from "../components/nodes/NodeShape";
import type { ModelOption } from "./model-option";

// ── Param types ────────────────────────────────────────────────────────────────

export enum TaskParamType {
    SELECT = "SELECT",
    STRING = "STRING",
    NUMBER = "NUMBER",
    NODE = "NODE", // chain connection (main nodes)
    SETTINGS = "SETTINGS", // setting placeholder (Model, Instruction…)
}

// ── Setting input (placeholders latéraux) ─────────────────────────────────────
// Inchangé par rapport à l'existant
export interface TaskSettingParam {
    name: string;
    type: TaskParamType.SELECT | TaskParamType.STRING | TaskParamType.NUMBER;
    nodeType: TaskType; // type du placeholder à créer (MODEL, INSTRUCTION…)
    helperText?: string;
    required?: boolean;
    hideHandle?: boolean;
    items?: ModelOption[];
    id?: string;
    position: { x: number; y: number };
}

export interface TaskChainOutput {
    nodeType: TaskType;
    optional: boolean;
    position: { x: number; y: number };
}

export interface Task {
    type: TaskType;
    label: string;
    description: string;
    shape: ShapeType;
    icon: React.ComponentType<React.ComponentProps<any>>;
    isEntryPoint: boolean;
    isEndPoint: boolean;
    isDeletable: boolean;
    isDraggable: boolean;
    sourcePosition?: Position;
    position?: { x: number; y: number };
    id?: string;

    inputs: TaskSettingParam[];

    chainOutputs?: TaskChainOutput[];
}

export type TaskParam = TaskSettingParam;

export enum TaskType {
    QUERY = "QUERY",
    REWRITER = "REWRITER",
    RETRIEVER = "RETRIEVER",
    RERANKER = "RERANKER",
    RESPONSE = "RESPONSE",
    MODEL = "MODEL",
    INSTRUCTION = "INSTRUCTION",
}
