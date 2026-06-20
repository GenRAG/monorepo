import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";

export interface AgentConsumption {
    agentId: string;
    agentName: string;
    creditsUsed: number;
    queryCount: number;
}

export interface WorkspaceConsumption {
    byAgent: AgentConsumption[];
    byDay: number[];
    total: number;
}

export const creditApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getCreditBalance: builder.query<number, string>({
            query: (workspaceId) => ({
                url: `/workspaces/${workspaceId}/credit-balance`,
                method: "GET",
            }),
            providesTags: (_result, _error, workspaceId) => [{ type: Tag.Credits, id: workspaceId }],
        }),
        getWorkspaceConsumption: builder.query<WorkspaceConsumption, { workspaceId: string; days: number }>({
            query: ({ workspaceId, days }) => ({
                url: `/workspaces/${workspaceId}/consumption`,
                params: { days },
            }),
        }),
    }),
});

export const { useGetCreditBalanceQuery, useGetWorkspaceConsumptionQuery } = creditApi;
