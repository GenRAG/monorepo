import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import type { AgentConsumption, WorkspaceConsumption, CreditBalanceSummary } from "types/credit/credit";

export type { AgentConsumption, WorkspaceConsumption, CreditBalanceSummary };

export const creditApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getCreditBalance: builder.query<CreditBalanceSummary, string>({
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
            providesTags: (_result, _error, { workspaceId }) => [{ type: Tag.Credits, id: workspaceId }],
        }),
    }),
});

export const { useGetCreditBalanceQuery, useGetWorkspaceConsumptionQuery } = creditApi;
