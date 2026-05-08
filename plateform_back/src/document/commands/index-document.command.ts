export interface IndexDocumentCommandProps {
    documentId: string;
    agentId: string;
    storageKey: string;
    mimeType: string;
    buffer: string | null;
}

export class IndexDocumentCommand {
    readonly documentId: string;
    readonly agentId: string;
    readonly storageKey: string;
    readonly mimeType: string;
    readonly buffer: string | null;

    constructor(props: IndexDocumentCommandProps) {
        this.documentId = props.documentId;
        this.agentId = props.agentId;
        this.storageKey = props.storageKey;
        this.mimeType = props.mimeType;
        this.buffer = props.buffer;
    }
}
