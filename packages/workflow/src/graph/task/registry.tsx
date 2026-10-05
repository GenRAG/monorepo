import { createContext, useContext } from "react";
import { Brain, Database, FileText, PencilIcon, Search, Sparkle, Speech } from "lucide-react";
import { TaskType, type Task, type TaskSpecRegistry, type WorkflowRegistry } from "../../types/task";
import { TASK_SPECS } from "../task-specs";
import { InstructionNode } from "../../components/nodes/SettingNodes/InstructionNode";
import { ModelNode } from "../../components/nodes/SettingNodes/ModelNode";

type TaskVisual = Pick<Task, "icon" | "component">;

const TASK_VISUALS: Record<TaskType, TaskVisual> = {
    [TaskType.QUERY]: { icon: Search },
    [TaskType.REWRITER]: { icon: PencilIcon },
    [TaskType.RETRIEVER]: { icon: Database },
    [TaskType.RERANKER]: { icon: Sparkle },
    [TaskType.RESPONSE]: { icon: Speech },
    [TaskType.MODEL]: { icon: Brain, component: ModelNode },
    [TaskType.INSTRUCTION]: { icon: FileText, component: InstructionNode },
};

/** Merges task specs with how they are drawn. Pass overrides to change icons or node components. */
export function createTaskRegistry(
    specs: TaskSpecRegistry = TASK_SPECS,
    visuals: Partial<Record<TaskType, Partial<TaskVisual>>> = {},
): WorkflowRegistry {
    return Object.fromEntries(
        (Object.keys(specs) as TaskType[]).map((type) => [type, { ...specs[type], ...TASK_VISUALS[type], ...visuals[type] }]),
    ) as WorkflowRegistry;
}

/** Default registry of the builder. */
export const TaskRegistry: WorkflowRegistry = createTaskRegistry();

export function getTaskDef(type: string, registry: WorkflowRegistry = TaskRegistry): Task | undefined {
    return registry[type as TaskType];
}

const TaskRegistryContext = createContext<WorkflowRegistry>(TaskRegistry);

/** Registry used by the node components below (`WorkflowCanvas` provides the one it was given). */
export const TaskRegistryProvider = TaskRegistryContext.Provider;

export const useTaskRegistry = () => useContext(TaskRegistryContext);
