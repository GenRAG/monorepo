import EventBus from 'src/lib/event-bus';
import { DocumentIndexedEvent, DocumentFailedEvent } from './document-event';
import { DocumentEventType } from 'src/events/document/document-event.type';
import { Logger } from 'nestjs-pino';

export function registerDocumentListeners(logger: Logger) {
    EventBus.on(
        DocumentEventType.DOCUMENT_INDEXED,
        (event: DocumentIndexedEvent) => {
            logger.log(
                `[DocumentListener] document=${event.documentId} indexed for agent=${event.agentId}`,
            );
        },
    );

    EventBus.on(
        DocumentEventType.DOCUMENT_FAILED,
        (event: DocumentFailedEvent) => {
            logger.error(
                `[DocumentListener] document=${event.documentId} failed permanently`,
            );
        },
    );
}
