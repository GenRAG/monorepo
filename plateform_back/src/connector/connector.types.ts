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
    /** Names of the documents removed because their Drive file is in the trash. */
    removed: string[];
    failed: FailedFile[];
}
