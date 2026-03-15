export enum DocumentStatus {
    UPLOADED = "uploaded",
    PROCESSING = "processing",
    INDEXED = "indexed",
    FAILED = "failed",
}

export interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    folderId: string | null;
    status: DocumentStatus;
    uploadedAt: Date;
    s3Key: string;
    indexedAt?: Date;
    error?: string;
}

export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: Date;
}

export interface UploadProgress {
    documentId: string;
    fileName: string;
    progress: number;
    status: DocumentStatus;
    error?: string;
}
