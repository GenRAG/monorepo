import { DatasetEntity } from "types/dataset/dataset";
import { DATASET_HEALTH_CONFIG, getDatasetHealth } from "utils/dataset/datasetStatus";

export type DatasetSortKey = "name" | "description" | "documents" | "activity" | "agents" | "updatedAt" | "status";
export interface DatasetSort {
    key: DatasetSortKey;
    direction: "asc" | "desc";
}

const SORT_VALUES: Record<DatasetSortKey, (dataset: DatasetEntity) => string | number> = {
    name: (d) => d.name.toLowerCase(),
    description: (d) => (d.description ?? "").toLowerCase(),
    documents: (d) => d.documentsCount,
    activity: (d) => (d.activity ?? []).reduce((sum, count) => sum + count, 0),
    agents: (d) => d.agentsCount,
    updatedAt: (d) => new Date(d.updatedAt).getTime(),
    status: (d) => DATASET_HEALTH_CONFIG[getDatasetHealth(d)].order,
};

export const sortDatasets = (datasets: DatasetEntity[], { key, direction }: DatasetSort): DatasetEntity[] => {
    const value = SORT_VALUES[key];
    const factor = direction === "asc" ? 1 : -1;
    return [...datasets].sort((a, b) => (value(a) > value(b) ? factor : value(a) < value(b) ? -factor : 0));
};
