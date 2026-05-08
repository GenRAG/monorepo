import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import {
    DocumentByIdParams,
    DocumentEntity,
    DocumentPaginatedParams,
    DocumentPaginatedResponse,
    DocumentRouteParams,
    DocumentStats,
    DocumentUrlResponse,
    UploadDocumentParams,
} from "types/document/document";

const getAgentDocumentsTagId = (workspaceId: string, agentId: string) =>
    `${workspaceId}-${agentId}`;

export const extendedDocumentApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        uploadDocument: builder.mutation<DocumentEntity, UploadDocumentParams>({
            query: ({ workspaceId, agentId, file }) => {
                const formData = new FormData();
                formData.append("file", file);

                return {
                    url: `/workspaces/${workspaceId}/agents/${agentId}/documents`,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: (_result, _error, { workspaceId, agentId }) => [
                {
                    type: Tag.Documents,
                    id: getAgentDocumentsTagId(workspaceId, agentId),
                },
            ],
        }),

        getAgentDocuments: builder.query<
            DocumentPaginatedResponse,
            DocumentPaginatedParams
        >({
            query: ({ workspaceId, agentId, page, limit }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/documents`,
                method: "GET",
                params: { page, limit },
            }),
            providesTags: (_result, _error, { workspaceId, agentId }) => [
                {
                    type: Tag.Documents as const,
                    id: getAgentDocumentsTagId(workspaceId, agentId),
                },
            ],
        }),

        getDocumentById: builder.query<DocumentEntity, DocumentByIdParams>({
            query: ({ workspaceId, agentId, id }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/documents/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [
                { type: Tag.Documents, id },
            ],
        }),

        getDocumentUrl: builder.query<DocumentUrlResponse, DocumentByIdParams>({
            query: ({ workspaceId, agentId, id }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/documents/${id}/url`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [
                { type: Tag.Documents, id },
            ],
        }),

        getAgentDocumentStats: builder.query<
            DocumentStats,
            DocumentRouteParams
        >({
            query: ({ workspaceId, agentId }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/documents/stats`,
                method: "GET",
            }),
            providesTags: (_result, _error, { workspaceId, agentId }) => [
                {
                    type: Tag.Documents as const,
                    id: getAgentDocumentsTagId(workspaceId, agentId),
                },
            ],
        }),

        deleteDocument: builder.mutation<void, DocumentByIdParams>({
            query: ({ workspaceId, agentId, id }) => ({
                url: `/workspaces/${workspaceId}/agents/${agentId}/documents/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (
                _result,
                _error,
                { workspaceId, agentId, id },
            ) => [
                { type: Tag.Documents, id },
                {
                    type: Tag.Documents,
                    id: getAgentDocumentsTagId(workspaceId, agentId),
                },
            ],
        }),
    }),
});

export const {
    useUploadDocumentMutation,
    useGetAgentDocumentsQuery,
    useGetAgentDocumentStatsQuery,
    useGetDocumentByIdQuery,
    useGetDocumentUrlQuery,
    useLazyGetDocumentUrlQuery,
    useDeleteDocumentMutation,
} = extendedDocumentApi;
