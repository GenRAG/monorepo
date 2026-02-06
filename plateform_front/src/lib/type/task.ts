import { ShapeType } from "components/Molecules/Nodes/NodeShape";
import { LucideIcon } from "lucide-react";

export enum TaskType {
    QUERY = "QUERY",
    RERANKER = "RERANKER",
    RESPONSE = "RESPONSE",
    RETRIEVER = "RETRIEVER",
}

export enum TaskParamType {
    STRING = "STRING",
    NUMBER = "NUMBER",
    BROWSER_INSTANCE = "BROWSER_INSTANCE",
    SELECT = "SELECT",
    DOCUMENT = "DOCUMENT",
}

export interface Task {
    type: TaskType;
    label: string;
    description: string;
    shape: ShapeType;
    inputs: TaskParam[];
    outputs: TaskParam[];
    id: string;
    isEntryPoint: boolean;
    isEndPoint: boolean;
    isDeletable: boolean;
    isDraggable: boolean;
    icon: (props: React.ComponentProps<LucideIcon>) => React.ReactNode;
}

export interface TaskParam {
    name: string;
    type: TaskParamType;
    helperText?: string;
    required?: boolean;
    hideHandle?: boolean;
    items?: string[];
    [key: string]: any;
    "id-2"?: string;
}

export enum TaskNodeFormat {
    ROUNDED = "rounded",
    HEXAGON = "hexagon",
}