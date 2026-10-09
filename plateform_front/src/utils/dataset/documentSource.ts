import { DocumentSource } from "types/dataset/dataset";

export const DOCUMENT_SOURCE_LABELS: Record<DocumentSource, string> = {
    UPLOAD: "Import manuel",
    GOOGLE_DRIVE: "Google Drive",
    SHAREPOINT: "SharePoint / OneDrive",
    NOTION: "Notion",
};

export const getDocumentSourceLabel = (source?: DocumentSource) => DOCUMENT_SOURCE_LABELS[source ?? "UPLOAD"];

export const DOCUMENT_SOURCES: DocumentSource[] = ["UPLOAD", "GOOGLE_DRIVE", "SHAREPOINT", "NOTION"];
