import { useMemo } from "react";
import { useGetWorkspaceDatasetsQuery } from "services/dataset/dataset";
import { DatasetEntity } from "types/dataset/dataset";

/** Workspace datasets split between those attached to the agent and the others. */
export const useAgentDatasets = (workspaceId: string, agentId: string) => {
    const query = useGetWorkspaceDatasetsQuery(workspaceId, {
        skip: !workspaceId,
    });

    const split = useMemo(() => {
        const attached: DatasetEntity[] = [];
        const others: DatasetEntity[] = [];
        for (const dataset of query.data ?? []) {
            (dataset.agents.some((agent) => agent.id === agentId) ? attached : others).push(dataset);
        }
        return { attached, others };
    }, [query.data, agentId]);

    return { ...split, isLoading: query.isLoading, isError: query.isError };
};
