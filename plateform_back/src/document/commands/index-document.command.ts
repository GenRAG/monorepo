export interface IndexDocumentCommandProps {
    documentId: string;
    agentId: string;
    storageKey: string;
    mimeType: string;
    buffer: string | null;
    name: string;
}
