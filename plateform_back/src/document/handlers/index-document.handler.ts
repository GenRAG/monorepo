import { Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentStatus } from 'generated/prisma';
import { DocumentFailedEvent, DocumentIndexedEvent } from 'src/events/document/document-event';
import { DocumentEventType } from 'src/events/document/document-event.type';
import EventBus from 'src/lib/event-bus';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DocumentRepository } from '../document.repository';
import { IndexDocumentCommandProps } from 'src/document/commands/index-document.command';

@Injectable()
export class IndexDocumentHandler {
    private readonly logger = new Logger(IndexDocumentHandler.name);

    constructor(
        private readonly documentRepository: DocumentRepository,
        private readonly ragEngineService: RagEngineService,
        @Inject('STORAGE_STRATEGY')
        private readonly storage: IStorageStrategy,
    ) {}

    async execute(command: IndexDocumentCommandProps): Promise<void> {
        await this.documentRepository.updateStatus(command.documentId, DocumentStatus.PROCESSING);

        const fileBuffer = command.buffer
            ? Buffer.from(command.buffer, 'base64')
            : await this.storage.get(command.storageKey);

        await this.ragEngineService.indexDocument(command.name, command.agentId, fileBuffer, command.mimeType);

        await this.documentRepository.updateStatus(command.documentId, DocumentStatus.INDEXED, {
            indexedAt: new Date(),
        });

        EventBus.emit(
            DocumentEventType.DOCUMENT_INDEXED,
            new DocumentIndexedEvent(command.documentId, command.agentId),
        );

        this.logger.log(`Document indexed successfully: ${command.documentId}`);
    }

    async retrying(command: IndexDocumentCommandProps, retryCount: number): Promise<void> {
        await this.documentRepository.updateStatus(command.documentId, DocumentStatus.PROCESSING, { retryCount });

        this.logger.warn(`Document retry ${retryCount}: ${command.documentId}`);
    }

    async failed(command: IndexDocumentCommandProps, errorMessage?: string): Promise<void> {
        await this.documentRepository.updateStatus(command.documentId, DocumentStatus.FAILED, {
            failedAt: new Date(),
            indexError: errorMessage,
        });

        EventBus.emit(DocumentEventType.DOCUMENT_FAILED, new DocumentFailedEvent(command.documentId, command.agentId));

        this.logger.warn(`Document marked as FAILED: ${command.documentId}`);
    }
}
