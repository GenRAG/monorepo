import { backendApi } from "services/api";
import { WorkspacePreview } from "types/workspace";

export const extendedUserApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({

        getUserWorkspaces: builder.query<WorkspacePreview[], void>({
            query: () => ({
                url: "/workspace/all",
                method: "GET",
            }),
        }),
    })
});

export const { useGetUserWorkspacesQuery } = extendedUserApi;