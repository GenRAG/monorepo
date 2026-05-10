import { backendApi } from "services/api";

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
        executeAgentRuntime: builder.mutation<
            ExecuteRuntimeResponse,
            ExecuteRuntimeParams
        >({
            query: ({ workspaceId, agentId, query }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/runtime`,
                method: "POST",
                body: { query },
            }),
        }),
    }),
});

export const { useExecuteAgentRuntimeMutation } = agentRuntimeApi;
