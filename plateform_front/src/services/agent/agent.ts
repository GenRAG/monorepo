import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import {
    Agent,
    AgentApiResponse,
    AgentByIdParams,
    CreateAgentParams,
    UpdateAgentParams,
} from "types/agent/agent";
import { AgentPreview } from "types/agent/agent";

const getWorkspaceAgentsTagId = (workspaceId: string) =>
    `workspace-${workspaceId}`;

export const extendedAgentApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getWorkspaceAgents: builder.query<AgentPreview[], string>({
            query: (workspaceId) => ({
                url: `/workspaces/${workspaceId}/agents`,
                method: "GET",
            }),
            providesTags: (result, _error, workspaceId) => {
                const listTag = {
                    type: Tag.Agents as const,
                    id: getWorkspaceAgentsTagId(workspaceId),
                };

                if (!result) {
                    return [listTag];
                }

                return [
                    ...result.map((agent) => ({
                        type: Tag.Agents as const,
                        id: agent.id,
                    })),
                    listTag,
                ];
            },
        }),

        getAgentById: builder.query<Agent, AgentByIdParams>({
            query: ({ workspaceId, id }) => ({
                url: `/workspaces/${workspaceId}/agents/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [
                { type: Tag.Agents, id },
            ],
        }),

        createAgent: builder.mutation<Agent, CreateAgentParams>({
            query: ({ workspaceId, ...body }) => ({
                url: `/workspaces/${workspaceId}/agents`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { workspaceId }) => [
                { type: Tag.Agents, id: getWorkspaceAgentsTagId(workspaceId) },
            ],
        }),

        updateAgent: builder.mutation<Agent, UpdateAgentParams>({
            query: ({ workspaceId, id, ...body }) => ({
                url: `/workspaces/${workspaceId}/agents/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { workspaceId, id }) => [
                { type: Tag.Agents, id },
                { type: Tag.Agents, id: getWorkspaceAgentsTagId(workspaceId) },
            ],
        }),

        deleteAgent: builder.mutation<void, AgentByIdParams>({
            query: ({ workspaceId, id }) => ({
                url: `/workspaces/${workspaceId}/agents/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { workspaceId, id }) => [
                { type: Tag.Agents, id },
                { type: Tag.Agents, id: getWorkspaceAgentsTagId(workspaceId) },
            ],
        }),
    }),
});

export const {
    useGetWorkspaceAgentsQuery,
    useGetAgentByIdQuery,
    useCreateAgentMutation,
    useUpdateAgentMutation,
    useDeleteAgentMutation,
} = extendedAgentApi;
