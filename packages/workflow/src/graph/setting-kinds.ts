import type { AppNodeData } from "../types/app-node";
import { TaskType } from "../types/task";

export const DATASET_ID_INPUT = "datasetId";

interface SettingKind {
    read(data: AppNodeData): string | undefined;
    write(data: AppNodeData, value: string): Partial<AppNodeData>;
}

export const SETTING_KINDS: Partial<Record<TaskType, SettingKind>> = {
    [TaskType.MODEL]: {
        read: (data) => data.modelName,
        write: (_data, value) => ({ modelName: value }),
    },
    [TaskType.INSTRUCTION]: {
        read: (data) => data.stringValue,
        write: (_data, value) => ({ stringValue: value, isEditing: false }),
    },
    [TaskType.DATASET]: {
        read: (data) => data.inputs?.[DATASET_ID_INPUT] as string | undefined,
        write: (data, value) => ({ inputs: { ...data.inputs, [DATASET_ID_INPUT]: value } }),
    },
};
