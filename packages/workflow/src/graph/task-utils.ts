import { TaskType, type TaskParam, type TaskSpec, type TaskSpecRegistry } from "../types/task";
import { TASK_SPECS } from "./task-specs";

// Every helper takes the registry to read (default: TASK_SPECS). A UI registry (`TaskRegistry` or a custom one)
// can be passed as is, since a Task is a TaskSpec plus drawing.

export function getTaskSpec<R extends TaskSpecRegistry = TaskSpecRegistry>(
    type: string,
    registry: R = TASK_SPECS as R,
): R[TaskType] | undefined {
    return registry[type as TaskType];
}

export const isSettingsTaskType = (type: TaskType) => type === TaskType.MODEL || type === TaskType.INSTRUCTION;

export function getNonSettingsTaskTypes(registry: TaskSpecRegistry = TASK_SPECS): TaskType[] {
    return (Object.keys(registry) as TaskType[]).filter((t) => !isSettingsTaskType(t));
}

export function getAddableTaskTypes(presentTypes: TaskType[], registry: TaskSpecRegistry = TASK_SPECS): TaskType[] {
    const addable = new Set<TaskType>();
    presentTypes.forEach((type) => {
        registry[type]?.chainOutputs?.forEach((o) => {
            if (!presentTypes.includes(o.nodeType)) {
                addable.add(o.nodeType);
            }
        });
    });
    return Array.from(addable);
}

export function getConfigInputs(taskType: TaskType, registry: TaskSpecRegistry = TASK_SPECS): TaskParam[] {
    return (registry[taskType]?.inputs ?? []).filter((i) => !i.hideHandle);
}

export function getChainOutputs(taskType: TaskType, registry: TaskSpecRegistry = TASK_SPECS): NonNullable<TaskSpec["chainOutputs"]> {
    return registry[taskType]?.chainOutputs ?? [];
}
