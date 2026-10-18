import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { DocumentStatus, Prisma } from 'generated/prisma';
import { DocumentFailedEvent, DocumentIndexedEvent } from 'src/events/document/document-event';
import { DocumentEventType } from 'src/events/document/document-event.type';
import EventBus from 'src/lib/event-bus';
import { RagDocumentScope, RagEngineService } from 'src/rag-engine/rag-execution.service';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DocumentRepository } from '../document.repository';
import { IndexDocumentCommandProps } from 'src/document/commands/index-document.command';

const isRecordNotFound = (e: unknown): boolean =>
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025';

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
        try {
            await this.documentRepository.updateStatus(command.documentId, DocumentStatus.PROCESSING);
        } catch (error) {
            if (!isRecordNotFound(error)) throw error;
            // Deleted before this attempt: a previous attempt may still have stored vectors.
            return this.dropVectorsOfDeletedDocument(command);
        }

        const fileBuffer = command.buffer
            ? Buffer.from(command.buffer, 'base64')
            : await this.storage.get(command.storageKey);

        const scope = await this.documentRepository.findEngineScope(command.datasetId);
        await this.ragEngineService.indexDocument(scope, command.name, fileBuffer, command.mimeType);

        try {
            await this.documentRepository.updateStatus(command.documentId, DocumentStatus.INDEXED, {
                indexedAt: new Date(),
            });
        } catch (error) {
            if (!isRecordNotFound(error)) throw error;
            // Deleted while the engine was indexing it: the delete found no vectors yet (404), the engine stored them
            // since. Left there, the agent would keep citing a document the user removed. The scope read before
            // indexing still holds if the dataset is gone too.
            return this.dropVectorsOfDeletedDocument(command, scope);
        }

        EventBus.emit(
            DocumentEventType.DOCUMENT_INDEXED,
            new DocumentIndexedEvent(command.documentId, command.datasetId),
        );

        this.logger.log(`Document indexed successfully: ${command.documentId}`);
    }

    async retrying(command: IndexDocumentCommandProps, retryCount: number): Promise<void> {
        await this.documentRepository.updateStatus(command.documentId, DocumentStatus.PROCESSING, { retryCount });

        this.logger.warn(`Document retry ${retryCount}: ${command.documentId}`);
    }

    async failed(command: IndexDocumentCommandProps, errorMessage?: string): Promise<void> {
        try {
            await this.documentRepository.updateStatus(command.documentId, DocumentStatus.FAILED, {
                failedAt: new Date(),
                indexError: errorMessage,
            });
        } catch (error) {
            if (!isRecordNotFound(error)) throw error;
            this.logger.log(`Document deleted before its indexing failed: ${command.documentId}`);
            return;
        }

        EventBus.emit(
            DocumentEventType.DOCUMENT_FAILED,
            new DocumentFailedEvent(command.documentId, command.datasetId),
        );

        this.logger.warn(`Document marked as FAILED: ${command.documentId}`);
    }

    private async dropVectorsOfDeletedDocument(
        command: IndexDocumentCommandProps,
        knownScope?: RagDocumentScope,
    ): Promise<void> {
        // The engine knows a document by its name only: a document added since under the same name owns them now.
        if (await this.documentRepository.findByName(command.datasetId, command.name)) {
            this.logger.warn(
                `Document deleted during indexing, name reused since, vectors kept: ${command.documentId}`,
            );
            return;
        }

        let scope = knownScope;
        if (!scope) {
            try {
                scope = await this.documentRepository.findEngineScope(command.datasetId);
            } catch (error) {
                if (!isRecordNotFound(error)) throw error;
                // The dataset is gone as well: its own cleanup removes the vectors of its documents.
                this.logger.warn(`Document and dataset deleted before indexing: ${command.documentId}`);
                return;
            }
        }

        try {
            await this.ragEngineService.deleteDocument(scope, command.name);
        } catch (error) {
            // 404: nothing was stored for it.
            if (!(error instanceof AxiosError && error.response?.status === 404)) throw error;
        }

        this.logger.log(`Document deleted during indexing, vectors removed: ${command.documentId}`);
    }
}
