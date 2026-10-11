export interface IndexDocumentCommandProps {
    documentId: string;
    datasetId: string;
    storageKey: string;
    mimeType: string;
    buffer: string | null;
    name: string;
}
