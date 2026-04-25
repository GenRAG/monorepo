import { TaskRegistry } from "./task/registry";
import { Task, TaskParam, TaskType } from "../types/task";

export function getTaskDef(type: string): Task | undefined {
    return TaskRegistry[type] as Task | undefined;
}

export function getNonSettingsTaskTypes(): TaskType[] {
    return (Object.keys(TaskRegistry) as TaskType[]).filter(
        (t) => t !== TaskType.MODEL && t !== TaskType.INSTRUCTION,
    );
}

export function getAddableTaskTypes(presentTypes: TaskType[]): TaskType[] {
    const addable = new Set<TaskType>();
    presentTypes.forEach((type) => {
        const task = TaskRegistry[type] as Task | undefined;
        task?.chainOutputs?.forEach((o) => {
            if (!presentTypes.includes(o.nodeType)) {
                addable.add(o.nodeType);
            }
        });
    });
    return Array.from(addable);
}

export function getConfigInputs(taskType: TaskType): TaskParam[] {
    const task = TaskRegistry[taskType] as Task;
    return task.inputs.filter(
        (i: TaskParam) => !i.hideHandle && taskType === task.type,
    );
}

export function getChainOutputs(taskType: TaskType) {
    const task = TaskRegistry[taskType] as Task;
    return task.chainOutputs ?? [];
}
