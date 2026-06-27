import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import { WorkflowEntity, WorkflowRouteParams, SaveWorkflowParams } from "types/workflow/workflow";

export const workflowTag = (agentId: string) => ({
    type: Tag.Workflow as const,
    id: agentId,
});

export const extendedWorkflowApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getActiveWorkflow: builder.query<WorkflowEntity, WorkflowRouteParams>({
            query: ({ workspaceId, agentId }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/workflow`,
                method: "GET",
            }),
            providesTags: (_result, _error, { agentId }) => [workflowTag(agentId)],
        }),

        updateWorkflow: builder.mutation<WorkflowEntity, SaveWorkflowParams>({
            query: ({ workspaceId, agentId, ...body }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/workflow`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { agentId }) => [workflowTag(agentId)],
        }),

        createWorkflow: builder.mutation<WorkflowEntity, SaveWorkflowParams>({
            query: ({ workspaceId, agentId, ...body }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/workflow`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { agentId }) => [workflowTag(agentId)],
        }),

        getWorkflowByVersion: builder.query<WorkflowEntity, WorkflowRouteParams & { version: number }>({
            query: ({ workspaceId, agentId, version }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/workflow/version/${version}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { agentId, version }) => [
                { type: Tag.Workflow, id: `${agentId}-v${version}` },
            ],
        }),
    }),
});

export const {
    useGetActiveWorkflowQuery,
    useUpdateWorkflowMutation,
    useCreateWorkflowMutation,
    useGetWorkflowByVersionQuery,
} = extendedWorkflowApi;
