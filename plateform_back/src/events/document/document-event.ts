import { DocumentEventType } from 'src/events/document/document-event.type';

export class DocumentIndexedEvent {
    constructor(
        readonly documentId: string,
        readonly agentId: string,
    ) {}

    readonly eventType = DocumentEventType.DOCUMENT_INDEXED;
    readonly timestamp = new Date().toISOString();
}

export class DocumentFailedEvent {
    constructor(
        readonly documentId: string,
        readonly agentId: string,
    ) {}

    readonly eventType = DocumentEventType.DOCUMENT_FAILED;
    readonly timestamp = new Date().toISOString();
}
