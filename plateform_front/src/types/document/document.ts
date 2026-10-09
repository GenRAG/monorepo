import type { DocumentSource } from "types/dataset/dataset";

export const DocumentStatus = {
    UPLOADED: "UPLOADED",
    PROCESSING: "PROCESSING",
    INDEXED: "INDEXED",
    FAILED: "FAILED",
} as const;

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export interface DocumentEntity {
    id: string;
    name: string;
    datasetId: string;
    size: number;
    storageKey: string;
    mimeType: string;
    status: DocumentStatus;
    indexedAt?: string | null;
    failedAt?: string | null;
    indexError?: string | null;
    retryCount?: number;
    createdAt: string;
    updatedAt?: string;
    source?: DocumentSource;
    externalUrl?: string | null;
    externalModifiedAt?: string | null;
}

export interface UploadDocumentParams {
    workspaceId: string;
    datasetId: string;
    file: File;
}

export interface DocumentRouteParams {
    workspaceId: string;
    datasetId: string;
}

export interface DocumentByIdParams extends DocumentRouteParams {
    id: string;
}

export interface DocumentUrlResponse {
    url: string;
}

export interface DocumentPaginatedParams extends DocumentRouteParams {
    page: number;
    limit: number;
    /** Empty or absent: every source. */
    sources?: DocumentSource[];
}

export interface DocumentPaginatedResponse {
    data: DocumentEntity[];
    total: number;
}

export interface DocumentStats {
    total: number;
    indexed: number;
    processing: number;
    sizeByMimeType: Record<string, number>;
    countBySource?: Partial<Record<DocumentSource, number>>;
}
