import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { DocumentStatus } from 'generated/prisma';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DocumentRepository } from './document.repository';
import EventBus from 'src/lib/event-bus';
import {
    DocumentIndexedEvent,
    DocumentFailedEvent,
} from 'src/events/document/document-event';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { DocumentEventType } from 'src/events/document/document-event.type';

interface IndexingJobPayload {
    documentId: string;
    agentId: string;
    storageKey: string;
    mimeType: string;
    size: number;
    buffer: string | null;
}

@Processor('documents')
export class DocumentProcessor extends WorkerHost {
    constructor(
        private readonly documentRepository: DocumentRepository,
        private readonly ragEngineService: RagEngineService,

        @Inject('STORAGE_STRATEGY')
        private readonly storage: IStorageStrategy,
    ) {
        super();
    }

    async process(job: Job<IndexingJobPayload>): Promise<void> {
        const { documentId, agentId, storageKey, mimeType, buffer } = job.data;

        await this.documentRepository.updateStatus(
            documentId,
            DocumentStatus.PROCESSING,
        );

        try {
            const fileBuffer = buffer
                ? Buffer.from(buffer, 'base64')
                : await this.storage.get(storageKey);

            await this.ragEngineService.indexDocument(
                documentId,
                fileBuffer,
                mimeType,
            );

            await this.documentRepository.updateStatus(
                documentId,
                DocumentStatus.INDEXED,
                { indexedAt: new Date() },
            );

            EventBus.emit(
                DocumentEventType.DOCUMENT_INDEXED,
                new DocumentIndexedEvent(documentId, agentId),
            );
        } catch (err) {
            const isLastAttempt =
                job.attemptsMade + 1 >= (job.opts.attempts ?? 5);

            if (isLastAttempt) {
                await this.documentRepository.updateStatus(
                    documentId,
                    DocumentStatus.FAILED,
                    { failedAt: new Date() },
                );
                EventBus.emit(
                    DocumentEventType.DOCUMENT_FAILED,
                    new DocumentFailedEvent(documentId, agentId),
                );
            }

            throw err;
        }
    }
}
