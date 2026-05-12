import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DocumentRepository } from './document.repository';
import { IndexDocumentCommandProps } from './commands/index-document.command';
import { File } from 'multer';

const SMALL_FILE_THRESHOLD = 5 * 1024 * 1024;
const INDEX_DOCUMENT_JOB = 'index-document';

@Injectable()
export class DocumentService {
    constructor(
        @Inject('STORAGE_STRATEGY')
        private readonly storage: IStorageStrategy,

        private readonly documentRepository: DocumentRepository,

        @InjectQueue('documents')
        private readonly documentQueue: Queue<IndexDocumentCommandProps>,
    ) {}

    async upload(file: File, agentId: string) {
        const s3Key = `agents/${agentId}/${Date.now()}-${file.originalname}`;

        await this.storage.put(s3Key, file.buffer, file.mimetype);

        const document = await this.documentRepository.create({
            agentId,
            storageKey: s3Key,
            mimeType: file.mimetype,
            name: file.originalname,
            size: file.size,
        });

        const payload: IndexDocumentCommandProps = {
            documentId: document.id,
            agentId,
            storageKey: s3Key,
            mimeType: file.mimetype,
            name: document.name,
            buffer: file.size < SMALL_FILE_THRESHOLD ? file.buffer.toString('base64') : null,
        };

        await this.documentQueue.add(INDEX_DOCUMENT_JOB, payload, {
            attempts: 5,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
        });

        return document;
    }

    async get(id: string) {
        const doc = await this.documentRepository.findById(id);

        if (!doc) {
            throw new NotFoundException(`Document ${id} not found`);
        }

        return doc;
    }

    async getUrl(id: string) {
        const doc = await this.documentRepository.findById(id);

        if (!doc) {
            throw new NotFoundException(`Document ${id} not found`);
        }

        const url = await this.storage.getSignedUrl(doc.storageKey, 900);

        return { url };
    }

    getByAgent(agentId: string) {
        return this.documentRepository.findByAgent(agentId);
    }

    getStats(agentId: string) {
        return this.documentRepository.getStats(agentId);
    }

    getByAgentPaginated(agentId: string, page: number, limit: number) {
        return this.documentRepository.findByAgentPaginated(agentId, page, limit);
    }

    async delete(id: string) {
        const doc = await this.documentRepository.findById(id);

        if (!doc) {
            throw new NotFoundException(`Document ${id} not found`);
        }

        await this.storage.delete(doc.storageKey);
        return this.documentRepository.delete(id);
    }
}
