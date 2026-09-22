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
    agentId: string;
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
}

export interface UploadDocumentParams {
    workspaceId: string;
    agentId: string;
    file: File;
}

export interface DocumentRouteParams {
    workspaceId: string;
    agentId: string;
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
}
