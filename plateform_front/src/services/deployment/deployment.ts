import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import { workflowTag } from "services/workflow/workflow";
import {
    Deployment,
    CurrentDeployment,
    DeploymentRouteParams,
    CreateDeploymentParams,
    RollbackParams,
} from "types/deployment/deployment";

const listTag = (agentId: string) => ({
    type: Tag.Deployments as const,
    id: `list-${agentId}`,
});

const currentTag = (agentId: string) => ({
    type: Tag.Deployments as const,
    id: `current-${agentId}`,
});

export const extendedDeploymentApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getDeployments: builder.query<Deployment[], DeploymentRouteParams>({
            query: ({ workspaceId, agentId }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/deployments`,
                method: "GET",
            }),
            providesTags: (_result, _error, { agentId }) => [listTag(agentId)],
        }),

        getCurrentDeployment: builder.query<CurrentDeployment, DeploymentRouteParams>({
            query: ({ workspaceId, agentId }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/deployments/current`,
                method: "GET",
            }),
            providesTags: (_result, _error, { agentId }) => [currentTag(agentId)],
        }),

        getDeploymentById: builder.query<Deployment, DeploymentRouteParams & { id: string }>({
            query: ({ workspaceId, agentId, id }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/deployments/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: Tag.Deployments, id }],
        }),

        createDeployment: builder.mutation<Deployment, CreateDeploymentParams>({
            query: ({ workspaceId, agentId, ...body }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/deployments`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { agentId }) => [
                listTag(agentId),
                currentTag(agentId),
                { type: Tag.Agents, id: agentId },
            ],
        }),

        rollbackDeployment: builder.mutation<Deployment, RollbackParams>({
            query: ({ workspaceId, agentId, ...body }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/deployments/rollback`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { agentId }) => [
                listTag(agentId),
                currentTag(agentId),
                workflowTag(agentId),
                { type: Tag.Agents as const, id: agentId },
            ],
            async onQueryStarted({ agentId }, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(backendApi.util.invalidateTags([{ type: Tag.Workflow, id: agentId }]));
                } catch {
                    // ignore
                }
            },
        }),
    }),
});

export const {
    useGetDeploymentsQuery,
    useGetCurrentDeploymentQuery,
    useGetDeploymentByIdQuery,
    useCreateDeploymentMutation,
    useRollbackDeploymentMutation,
} = extendedDeploymentApi;
