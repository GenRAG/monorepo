import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";

export interface AgentMember {
    id: string;
    userId: string;
    email: string;
    name: string | null;
    createdAt: string;
}

interface AgentMemberParams {
    workspaceId: string;
    agentId: string;
}

export const extendedAgentMembersApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getAgentMembers: builder.query<AgentMember[], AgentMemberParams>({
            query: ({ workspaceId, agentId }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/members`,
                method: "GET",
            }),
            providesTags: (_result, _error, { agentId }) => [{ type: Tag.AgentMembers, id: agentId }],
        }),

        addAgentMember: builder.mutation<AgentMember, AgentMemberParams & { email: string }>({
            query: ({ workspaceId, agentId, email }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/members`,
                method: "POST",
                body: { email },
            }),
            invalidatesTags: (_result, _error, { agentId }) => [{ type: Tag.AgentMembers, id: agentId }],
        }),

        removeAgentMember: builder.mutation<void, AgentMemberParams & { memberId: string }>({
            query: ({ workspaceId, agentId, memberId }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/members/${memberId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { agentId }) => [{ type: Tag.AgentMembers, id: agentId }],
        }),
    }),
});

export const { useGetAgentMembersQuery, useAddAgentMemberMutation, useRemoveAgentMemberMutation } =
    extendedAgentMembersApi;
