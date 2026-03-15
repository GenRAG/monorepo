import { backendApi } from "services/api";
import { WorkspacePreview } from "types/workspace";

interface WorkspaceApiResponse {
    id: string;
    name: string;
    updatedAt?: string;
}

export const extendedUserApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getUserWorkspaces: builder.query<WorkspacePreview[], void>({
            query: () => ({
                url: "/workspace/all",
                method: "GET",
            }),
            transformResponse: (response: WorkspaceApiResponse[]) =>
                response.map((w) => ({
                    id: w.id,
                    name: w.name,
                    documentsCount: 0,
                    updatedAt: w.updatedAt,
                })),
        }),
    }),
});

export const { useGetUserWorkspacesQuery } = extendedUserApi;
