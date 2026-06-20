import { backendApi } from "services/api";

interface ExecuteRuntimeParams {
    workspaceId: string;
    agentId: string;
    query: string;
}

interface ExecuteRuntimeResponse {
    answer: string;
}

export type QueryLogStatus = "SUCCESS" | "ERROR" | "OUT_OF_CREDITS";

export interface QueryLog {
    id: string;
    query: string;
    durationMs: number;
    status: QueryLogStatus;
    createdAt: string;
    creditsUsed?: number;
}

export interface QueryLogPage {
    data: QueryLog[];
    total: number;
}

export const agentRuntimeApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        executeAgentRuntime: builder.mutation<ExecuteRuntimeResponse, ExecuteRuntimeParams>({
            query: ({ workspaceId, agentId, query }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/runtime`,
                method: "POST",
                body: { query },
            }),
        }),
        getQueryLogs: builder.query<
            QueryLogPage,
            { workspaceId: string; agentId: string; page?: number; limit?: number }
        >({
            query: ({ workspaceId, agentId, page = 1, limit = 20 }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/runtime/query-logs`,
                params: { page, limit },
            }),
        }),
    }),
});

export const { useExecuteAgentRuntimeMutation, useGetQueryLogsQuery } = agentRuntimeApi;
