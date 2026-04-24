import { TaskRegistry as LegacyTaskRegistry } from "./task/registry";
import { Task, TaskParam, TaskType } from "../types/task";

export function getTaskDef(type: string): Task | undefined {
    return LegacyTaskRegistry[type] as Task | undefined;
}

export function listAddableTaskTypes(): TaskType[] {
    return (Object.keys(LegacyTaskRegistry) as TaskType[]).filter(
        (t) => t !== TaskType.MODEL && t !== TaskType.INSTRUCTION,
    );
}

export function getConfigInputs(taskType: TaskType): TaskParam[] {
    const task = LegacyTaskRegistry[taskType] as Task;
    return task.inputs.filter(
        (i: TaskParam) => !i.hideHandle && taskType === task.type,
    );
}

export function getChainOutputs(taskType: TaskType) {
    const task = LegacyTaskRegistry[taskType] as Task;
    return task.chainOutputs ?? [];
}
