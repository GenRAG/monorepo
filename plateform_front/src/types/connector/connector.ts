import type { DocumentRouteParams } from "types/document/document";

export interface GoogleDriveSyncParams extends DocumentRouteParams {
    accessToken: string;
}

export interface GoogleDriveImportParams extends GoogleDriveSyncParams {
    fileIds: string[];
}

export interface FailedFile {
    name: string;
    reason: string;
}

export interface ConnectorImportResult {
    imported: number;
    failed: FailedFile[];
}

export interface ConnectorSyncResult {
    updated: number;
    unchanged: number;
    failed: FailedFile[];
}
