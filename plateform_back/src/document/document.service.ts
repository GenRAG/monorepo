// src/document/document.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DocumentRepository } from './document.repository';
import { File } from 'multer';

const SMALL_FILE_THRESHOLD = 5 * 1024 * 1024;
const documentQueueName = 'index-document';

@Injectable()
export class DocumentService {
    constructor(
        @Inject('STORAGE_STRATEGY')
        private readonly storage: IStorageStrategy,

        private readonly documentRepository: DocumentRepository,

        @InjectQueue('documents')
        private readonly documentQueue: Queue,
    ) {}

    async uploadDocument(file: File, agentId: string) {
        const s3Key = `agents/${agentId}/${Date.now()}-${file.originalname}`;

        await this.storage.put(s3Key, file.buffer, file.mimetype);

        const document = await this.documentRepository.create({
            agentId,
            storageKey: s3Key,
            mimeType: file.mimetype,
        });

        const isSmall = file.size < SMALL_FILE_THRESHOLD;
        await this.documentQueue.add(
            documentQueueName,
            {
                documentId: document.id,
                agentId,
                storageKey: s3Key,
                mimeType: file.mimetype,
                size: file.size,
                buffer: isSmall ? file.buffer.toString('base64') : null,
            },
            {
                attempts: 5,
                backoff: { type: 'exponential', delay: 3000 },
                removeOnComplete: true,
                removeOnFail: false,
            },
        );

        return document;
    }

    async getDocument(id: string) {
        const doc = await this.documentRepository.findById(id);

        if (!doc) {
            throw new NotFoundException(`Document ${id} not found`);
        }

        return doc;
    }

    async getDocumentUrl(id: string) {
        const doc = await this.documentRepository.findById(id);

        if (!doc) {
            throw new NotFoundException(`Document ${id} not found`);
        }

        const url = await this.storage.getSignedUrl(doc.storageKey, 900);

        return { url };
    }

    getDocumentsByAgent(agentId: string) {
        return this.documentRepository.findByAgent(agentId);
    }
}
