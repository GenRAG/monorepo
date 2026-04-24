import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import {
    WorkflowEntity,
    WorkflowRouteParams,
    SaveWorkflowParams,
} from "types/workflow/workflow";

const workflowTag = (agentId: string) => ({
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
            providesTags: (_result, _error, { agentId }) => [
                workflowTag(agentId),
            ],
        }),

        updateWorkflow: builder.mutation<WorkflowEntity, SaveWorkflowParams>({
            query: ({ workspaceId, agentId, ...body }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/workflow`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { agentId }) => [
                workflowTag(agentId),
            ],
        }),

        createWorkflow: builder.mutation<WorkflowEntity, SaveWorkflowParams>({
            query: ({ workspaceId, agentId, ...body }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/workflow`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { agentId }) => [
                workflowTag(agentId),
            ],
        }),
    }),
});

export const {
    useGetActiveWorkflowQuery,
    useUpdateWorkflowMutation,
    useCreateWorkflowMutation,
} = extendedWorkflowApi;
