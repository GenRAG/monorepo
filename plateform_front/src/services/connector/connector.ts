import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import { workspaceStatsTag } from "services/workspace/workspace";
import { datasetListTag, datasetTag } from "services/dataset/dataset";
import { getDatasetDocumentsTagId } from "services/document/document";
import {
    ConnectorImportResult,
    ConnectorSyncResult,
    GoogleDriveImportParams,
    GoogleDriveSyncParams,
} from "types/connector/connector";
import { DocumentRouteParams } from "types/document/document";

const datasetContentTags = (_result: unknown, _error: unknown, { workspaceId, datasetId }: DocumentRouteParams) => [
    { type: Tag.Documents, id: getDatasetDocumentsTagId(workspaceId, datasetId) },
    workspaceStatsTag(workspaceId),
    datasetListTag(workspaceId),
    datasetTag(datasetId),
];

export const extendedConnectorApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        importFromGoogleDrive: builder.mutation<ConnectorImportResult, GoogleDriveImportParams>({
            query: ({ workspaceId, datasetId, accessToken, fileIds }) => ({
                url: `/workspaces/${workspaceId}/datasets/${datasetId}/connectors/google-drive/import`,
                method: "POST",
                body: { accessToken, fileIds },
            }),
            invalidatesTags: datasetContentTags,
        }),

        syncGoogleDrive: builder.mutation<ConnectorSyncResult, GoogleDriveSyncParams>({
            query: ({ workspaceId, datasetId, accessToken }) => ({
                url: `/workspaces/${workspaceId}/datasets/${datasetId}/connectors/google-drive/sync`,
                method: "POST",
                body: { accessToken },
            }),
            invalidatesTags: datasetContentTags,
        }),
    }),
});

export const { useImportFromGoogleDriveMutation, useSyncGoogleDriveMutation } = extendedConnectorApi;
