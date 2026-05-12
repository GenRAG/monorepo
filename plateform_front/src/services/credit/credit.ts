import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";

export const creditApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getCreditBalance: builder.query<number, string>({
            query: (workspaceId) => ({
                url: `/workspaces/${workspaceId}/credit-balance`,
                method: "GET",
            }),
            providesTags: (_result, _error, workspaceId) => [
                { type: Tag.Credits, id: workspaceId },
            ],
        }),
    }),
});

export const { useGetCreditBalanceQuery } = creditApi;
