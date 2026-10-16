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
