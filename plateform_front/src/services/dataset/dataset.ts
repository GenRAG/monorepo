import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import { getWorkspaceAgentsTagId } from "services/agent/agent";
import {
    CreateDatasetParams,
    DatasetAnalytics,
    DatasetAnalyticsParams,
    DatasetAgentParams,
    DatasetByIdParams,
    DatasetEntity,
    SetDatasetAgentsParams,
    UpdateDatasetParams,
} from "types/dataset/dataset";

export const datasetListTag = (workspaceId: string) => ({ type: Tag.Datasets, id: `${workspaceId}-LIST` }) as const;
export const datasetTag = (id: string) => ({ type: Tag.Datasets, id }) as const;
const workspaceAgentsTag = (workspaceId: string) =>
    ({ type: Tag.Agents, id: getWorkspaceAgentsTagId(workspaceId) }) as const;

export const extendedDatasetApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getWorkspaceDatasets: builder.query<DatasetEntity[], string>({
            query: (workspaceId) => `/workspaces/${workspaceId}/datasets`,
            providesTags: (result, _error, workspaceId) => [
                datasetListTag(workspaceId),
                ...(result ?? []).map((dataset) => datasetTag(dataset.id)),
            ],
        }),

        getDatasetById: builder.query<DatasetEntity, DatasetByIdParams>({
            query: ({ workspaceId, id }) => `/workspaces/${workspaceId}/datasets/${id}`,
            providesTags: (_result, _error, { id }) => [datasetTag(id)],
        }),

        getDatasetAnalytics: builder.query<DatasetAnalytics, DatasetAnalyticsParams>({
            query: ({ workspaceId, id, days }) => ({
                url: `/workspaces/${workspaceId}/datasets/${id}/analytics`,
                params: { days },
            }),
            providesTags: (_result, _error, { id }) => [datasetTag(id)],
        }),

        createDataset: builder.mutation<DatasetEntity, CreateDatasetParams>({
            query: ({ workspaceId, ...body }) => ({
                url: `/workspaces/${workspaceId}/datasets`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, { workspaceId }) => [datasetListTag(workspaceId)],
        }),

        updateDataset: builder.mutation<DatasetEntity, UpdateDatasetParams>({
            query: ({ workspaceId, id, ...body }) => ({
                url: `/workspaces/${workspaceId}/datasets/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { workspaceId, id }) => [datasetListTag(workspaceId), datasetTag(id)],
        }),

        deleteDataset: builder.mutation<void, DatasetByIdParams>({
            query: ({ workspaceId, id }) => ({
                url: `/workspaces/${workspaceId}/datasets/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { workspaceId, id }) => [
                datasetListTag(workspaceId),
                datasetTag(id),
                workspaceAgentsTag(workspaceId),
            ],
        }),

        attachDatasetToAgent: builder.mutation<void, DatasetAgentParams>({
            query: ({ workspaceId, id, agentId }) => ({
                url: `/workspaces/${workspaceId}/datasets/${id}/agents/${agentId}`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, { workspaceId, id }) => [
                datasetListTag(workspaceId),
                datasetTag(id),
                workspaceAgentsTag(workspaceId),
            ],
        }),

        detachDatasetFromAgent: builder.mutation<void, DatasetAgentParams>({
            query: ({ workspaceId, id, agentId }) => ({
                url: `/workspaces/${workspaceId}/datasets/${id}/agents/${agentId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { workspaceId, id }) => [
                datasetListTag(workspaceId),
                datasetTag(id),
                workspaceAgentsTag(workspaceId),
            ],
        }),

        setDatasetAgents: builder.mutation<void, SetDatasetAgentsParams>({
            query: ({ workspaceId, id, agentIds }) => ({
                url: `/workspaces/${workspaceId}/datasets/${id}/agents`,
                method: "PUT",
                body: { agentIds },
            }),
            invalidatesTags: (_result, _error, { workspaceId, id }) => [
                datasetListTag(workspaceId),
                datasetTag(id),
                workspaceAgentsTag(workspaceId),
            ],
        }),
    }),
});

export const {
    useGetWorkspaceDatasetsQuery,
    useGetDatasetByIdQuery,
    useGetDatasetAnalyticsQuery,
    useCreateDatasetMutation,
    useUpdateDatasetMutation,
    useDeleteDatasetMutation,
    useAttachDatasetToAgentMutation,
    useDetachDatasetFromAgentMutation,
    useSetDatasetAgentsMutation,
} = extendedDatasetApi;
