import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import { workspaceStatsTag } from "services/workspace/workspace";
import { datasetListTag, datasetTag } from "services/dataset/dataset";
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

const getDatasetDocumentsTagId = (workspaceId: string, datasetId: string) => `${workspaceId}-${datasetId}`;

export const extendedDocumentApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        uploadDocument: builder.mutation<DocumentEntity, UploadDocumentParams>({
            query: ({ workspaceId, datasetId, file }) => {
                const formData = new FormData();
                formData.append("file", file);

                return {
                    url: `/workspaces/${workspaceId}/datasets/${datasetId}/documents`,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: (_result, _error, { workspaceId, datasetId }) => [
                {
                    type: Tag.Documents,
                    id: getDatasetDocumentsTagId(workspaceId, datasetId),
                },
                workspaceStatsTag(workspaceId),
                datasetListTag(workspaceId),
                datasetTag(datasetId),
            ],
        }),

        getDatasetDocuments: builder.query<DocumentPaginatedResponse, DocumentPaginatedParams>({
            query: ({ workspaceId, datasetId, page, limit, sources = [] }) => ({
                // Repeated `source` keys (the API reads one value or several); `params` would join an array with commas.
                url: `/workspaces/${workspaceId}/datasets/${datasetId}/documents?${new URLSearchParams([
                    ["page", String(page)],
                    ["limit", String(limit)],
                    ...sources.map((source) => ["source", source]),
                ]).toString()}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { workspaceId, datasetId }) => [
                {
                    type: Tag.Documents as const,
                    id: getDatasetDocumentsTagId(workspaceId, datasetId),
                },
            ],
        }),

        getDocumentById: builder.query<DocumentEntity, DocumentByIdParams>({
            query: ({ workspaceId, datasetId, id }) => ({
                url: `/workspaces/${workspaceId}/datasets/${datasetId}/documents/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: Tag.Documents, id }],
        }),

        getDocumentUrl: builder.query<DocumentUrlResponse, DocumentByIdParams>({
            query: ({ workspaceId, datasetId, id }) => ({
                url: `/workspaces/${workspaceId}/datasets/${datasetId}/documents/${id}/url`,
                method: "GET",
            }),
            providesTags: (_result, _error, { id }) => [{ type: Tag.Documents, id }],
        }),

        getDatasetDocumentStats: builder.query<DocumentStats, DocumentRouteParams>({
            query: ({ workspaceId, datasetId }) => ({
                url: `/workspaces/${workspaceId}/datasets/${datasetId}/documents/stats`,
                method: "GET",
            }),
            providesTags: (_result, _error, { workspaceId, datasetId }) => [
                {
                    type: Tag.Documents as const,
                    id: getDatasetDocumentsTagId(workspaceId, datasetId),
                },
            ],
        }),

        getDocumentContent: builder.query<string, DocumentByIdParams>({
            query: ({ workspaceId, datasetId, id }) => ({
                url: `/workspaces/${workspaceId}/datasets/${datasetId}/documents/${id}/content`,
                method: "GET",
                responseHandler: "text",
            }),
        }),

        retryDocument: builder.mutation<{ id: string }, DocumentByIdParams>({
            query: ({ workspaceId, datasetId, id }) => ({
                url: `/workspaces/${workspaceId}/datasets/${datasetId}/documents/${id}/retry`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, { workspaceId, datasetId, id }) => [
                { type: Tag.Documents, id },
                {
                    type: Tag.Documents,
                    id: getDatasetDocumentsTagId(workspaceId, datasetId),
                },
            ],
        }),

        deleteDocument: builder.mutation<void, DocumentByIdParams>({
            query: ({ workspaceId, datasetId, id }) => ({
                url: `/workspaces/${workspaceId}/datasets/${datasetId}/documents/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { workspaceId, datasetId, id }) => [
                { type: Tag.Documents, id },
                {
                    type: Tag.Documents,
                    id: getDatasetDocumentsTagId(workspaceId, datasetId),
                },
                workspaceStatsTag(workspaceId),
                datasetListTag(workspaceId),
                datasetTag(datasetId),
            ],
        }),
    }),
});

export const {
    useUploadDocumentMutation,
    useGetDatasetDocumentsQuery,
    useGetDatasetDocumentStatsQuery,
    useGetDocumentByIdQuery,
    useLazyGetDocumentByIdQuery,
    useGetDocumentUrlQuery,
    useLazyGetDocumentUrlQuery,
    useGetDocumentContentQuery,
    useRetryDocumentMutation,
    useDeleteDocumentMutation,
} = extendedDocumentApi;
