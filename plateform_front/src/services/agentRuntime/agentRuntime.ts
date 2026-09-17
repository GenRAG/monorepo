import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import type { QueryLogStatus, QueryLogEntry, QueryLogPage } from "types/analytics/analytics";

export type { QueryLogStatus, QueryLogPage };
// `QueryLog` is the pre-existing name in this file's public API; kept as an alias of the type
// shared with services/analytics/analytics.ts (same shape, previously duplicated).
export type { QueryLogEntry as QueryLog };

interface ExecuteRuntimeParams {
    workspaceId: string;
    agentId: string;
    query: string;
}

interface ExecuteRuntimeResponse {
    answer: string;
}

export const agentRuntimeApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        executeAgentRuntime: builder.mutation<ExecuteRuntimeResponse, ExecuteRuntimeParams>({
            query: ({ workspaceId, agentId, query }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/runtime`,
                method: "POST",
                body: { query },
            }),
            invalidatesTags: [Tag.Credits],
        }),
        getQueryLogs: builder.query<
            QueryLogPage,
            { workspaceId: string; agentId: string; page?: number; limit?: number }
        >({
            query: ({ workspaceId, agentId, page = 1, limit = 20 }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/runtime/query-logs`,
                params: { page, limit },
            }),
            providesTags: (_result, _error, { agentId }) => [{ type: Tag.Analytics, id: agentId }],
        }),
    }),
});

export const { useExecuteAgentRuntimeMutation, useGetQueryLogsQuery } = agentRuntimeApi;
