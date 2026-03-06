import { Position } from "@xyflow/react";
import { ShapeType } from "components/Molecules/Nodes/NodeShape";

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
    items?: string[];
    id?: string;
    position: { x: number; y: number };
}

// ── Chain connection (outputs optionnels dans la chaîne principale) ────────────
// Référence uniquement un TaskType — pas de duplication d'infos
export interface TaskChainOutput {
    nodeType: TaskType; // référence au TaskRegistry — pas de redéfinition
    optional: boolean; // true = le node peut être absent de la chaîne
    position: { x: number; y: number }; // position relative si auto-placé
}

// ── Task definition ────────────────────────────────────────────────────────────
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

    // Settings latéraux (Model, Instruction…) — inchangé
    inputs: TaskSettingParam[];

    // Nodes optionnels insérables dans la chaîne principale
    // ex: Query → outputs: [{ nodeType: REWRITER, optional: true }]
    chainOutputs?: TaskChainOutput[];
}

// ── Backward compat ────────────────────────────────────────────────────────────
// Pour ne pas casser le code existant qui utilise TaskParam
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
