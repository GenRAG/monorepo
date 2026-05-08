import { DocumentStatus } from "types/document/document";

export interface UploadProgress {
    documentId: string;
    fileName: string;
    progress: number;
    status: DocumentStatus;
    error?: string;
}
