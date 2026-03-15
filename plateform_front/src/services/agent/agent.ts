import { backendApi } from "services/api";
import { AgentPreview } from "types/agent";

interface AgentApiResponse {
    id: string;
    name: string;
    updatedAt?: string;
}

export const extendedAgentApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getWorkspaceAgents: builder.query<AgentPreview[], string | void>({
            query: (_workspaceId) => ({
                url: "/workspace/all",
                method: "GET",
            }),
            transformResponse: (
                response: AgentApiResponse[],
                _meta,
                workspaceId,
            ) =>
                response.map((w) => ({
                    id: w.id,
                    name: w.name,
                    workspaceId: workspaceId ?? "default",
                    documentsCount: 0,
                    updatedAt: w.updatedAt,
                })),
        }),
    }),
});

export const { useGetWorkspaceAgentsQuery } = extendedAgentApi;
export const useGetOrganisationAgentsQuery = useGetWorkspaceAgentsQuery;
