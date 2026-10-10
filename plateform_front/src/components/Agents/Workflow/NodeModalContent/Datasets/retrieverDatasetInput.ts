import { TASK_SPECS, TaskType, settingSourceHandle } from "@genrag/workflow";

/** The RETRIEVER input that DATASET setting nodes hang off. */
export const RETRIEVER_DATASET_INPUT = TASK_SPECS[TaskType.RETRIEVER].inputs.find(
    (input) => input.nodeType === TaskType.DATASET,
)!;

export const RETRIEVER_DATASET_HANDLE = settingSourceHandle(RETRIEVER_DATASET_INPUT.name);
