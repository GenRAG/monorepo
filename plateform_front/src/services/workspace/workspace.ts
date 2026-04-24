import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import {
    Workspace,
    WorkspaceCreateRequest,
    WorkspaceDetail,
} from "types/workspace";

export const workspaceApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getUserWorkspaces: builder.query<Workspace[], void>({
            query: () => ({
                url: "/workspaces",
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({
                              type: Tag.Workspaces,
                              id,
                          })),
                          { type: Tag.Workspaces, id: "LIST" },
                      ]
                    : [{ type: Tag.Workspaces, id: "LIST" }],
        }),

        getWorkspaceById: builder.query<WorkspaceDetail, string>({
            query: (workspaceId) => ({
                url: `/workspaces/${workspaceId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, workspaceId) => [
                { type: Tag.Workspaces, id: workspaceId },
            ],
        }),

        createWorkspace: builder.mutation<Workspace, WorkspaceCreateRequest>({
            query: (data) => ({
                url: "/workspaces",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: Tag.Workspaces, id: "LIST" }],
        }),

        deleteWorkspace: builder.mutation<void, string>({
            query: (workspaceId) => ({
                url: `/workspaces/${workspaceId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, workspaceId) => [
                { type: Tag.Workspaces, id: "LIST" },
                { type: Tag.Workspaces, id: workspaceId },
            ],
        }),
    }),
});

export const {
    useGetUserWorkspacesQuery,
    useGetWorkspaceByIdQuery,
    useCreateWorkspaceMutation,
    useDeleteWorkspaceMutation,
} = workspaceApi;
