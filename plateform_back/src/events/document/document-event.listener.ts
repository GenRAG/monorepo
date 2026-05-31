import EventBus from 'src/lib/event-bus';
import { DocumentIndexedEvent, DocumentFailedEvent } from './document-event';
import { DocumentEventType } from 'src/events/document/document-event.type';
import { Logger } from 'nestjs-pino';

export function registerDocumentListeners(logger: Logger): () => void {
    const onIndexed = (event: DocumentIndexedEvent) => {
        logger.log(`[DocumentListener] document=${event.documentId} indexed for agent=${event.agentId}`);
    };

    const onFailed = (event: DocumentFailedEvent) => {
        logger.error(`[DocumentListener] document=${event.documentId} failed permanently`);
    };

    EventBus.on(DocumentEventType.DOCUMENT_INDEXED, onIndexed);
    EventBus.on(DocumentEventType.DOCUMENT_FAILED, onFailed);

    return () => {
        EventBus.removeListener(DocumentEventType.DOCUMENT_INDEXED, onIndexed);
        EventBus.removeListener(DocumentEventType.DOCUMENT_FAILED, onFailed);
    };
}
