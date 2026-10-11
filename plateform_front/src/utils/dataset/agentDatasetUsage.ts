import type { WorkflowDefinition } from "@genrag/workflow";

/** How an agent's saved workflow treats a dataset attached to it. */
export type AgentDatasetUsage = "used" | "excluded" | "no-search";

type RetrieveLike = { type: string; datasetIds?: unknown };

/**
 * Reads the saved workflow: a retriever without dataset settings searches every attached dataset, one with
 * dataset settings only searches those. Without a retriever, no dataset is searched.
 */
export const getAgentDatasetUsage = (
    definition: Partial<WorkflowDefinition> | Record<string, unknown> | undefined,
    datasetId: string,
): AgentDatasetUsage => {
    const blocks = (Array.isArray(definition) ? definition : (definition?.blocks ?? [])) as RetrieveLike[];
    const retrieve = blocks.find((block) => block?.type === "retrieve");
    if (!retrieve) return "no-search";

    const datasetIds = Array.isArray(retrieve.datasetIds) ? (retrieve.datasetIds as string[]) : [];
    if (datasetIds.length === 0 || datasetIds.includes(datasetId)) return "used";
    return "excluded";
};
