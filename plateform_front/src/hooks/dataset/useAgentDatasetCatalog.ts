import { useMemo } from "react";
import type { DatasetCatalogEntry } from "@genrag/workflow";
import { useAgentDatasets } from "hooks/dataset/useAgentDatasets";

export const useAgentDatasetCatalog = (workspaceId: string, agentId: string) => {
    const { attached, isLoading } = useAgentDatasets(workspaceId, agentId);
    return useMemo<Record<string, DatasetCatalogEntry> | null>(
        () =>
            isLoading
                ? null
                : Object.fromEntries(attached.map((d) => [d.id, { name: d.name, documentsCount: d.documentsCount }])),
        [attached, isLoading],
    );
};
