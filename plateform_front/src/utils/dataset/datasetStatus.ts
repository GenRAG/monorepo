import { DatasetEntity } from "types/dataset/dataset";

export type DatasetHealth = "empty" | "ready" | "indexing" | "error";

export const DATASET_HEALTH_CONFIG: Record<DatasetHealth, { label: string; colorScheme: string; order: number }> = {
    error: { label: "Erreurs", colorScheme: "red", order: 0 },
    indexing: { label: "En cours", colorScheme: "orange", order: 1 },
    ready: { label: "Prête", colorScheme: "green", order: 2 },
    empty: { label: "Vide", colorScheme: "gray", order: 3 },
};

export const getDatasetHealth = (dataset: Pick<DatasetEntity, "statusCounts" | "documentsCount">): DatasetHealth => {
    if (dataset.documentsCount === 0) return "empty";
    if (dataset.statusCounts.FAILED > 0) return "error";
    if (dataset.statusCounts.PROCESSING > 0 || dataset.statusCounts.UPLOADED > 0) return "indexing";
    return "ready";
};

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
    `${count} ${count > 1 ? plural : singular}`;
