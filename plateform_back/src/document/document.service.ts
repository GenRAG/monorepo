import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { basename } from 'path';
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as multer from 'multer';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DocumentRepository } from './document.repository';
import { IndexDocumentCommandProps } from './commands/index-document.command';
import { ConfigService } from '@nestjs/config';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import ms from 'ms';

const SMALL_FILE_THRESHOLD = 5 * 1024 * 1024;
const MAX_AGENT_STORAGE = 100 * 1024 * 1024;
const INDEX_DOCUMENT_JOB = 'index-document';

const sanitizeFilename = (name: string): string => basename(name).replace(/[^\w.-]/g, '_');

@Injectable()
export class DocumentService {
    constructor(
        @Inject('STORAGE_STRATEGY')
        private readonly storage: IStorageStrategy,

        private readonly documentRepository: DocumentRepository,

        private readonly configService: ConfigService,

        private readonly ragEngineService: RagEngineService,

        @InjectQueue('documents')
        private readonly documentQueue: Queue<IndexDocumentCommandProps>,
    ) {}

    async upload(file: Express.Multer.File, agentId: string) {
        const usedStorage = await this.documentRepository.getTotalSize(agentId);
        if (usedStorage + file.size > MAX_AGENT_STORAGE) {
            throw new BadRequestException(
                `Storage limit reached: agent cannot exceed ${MAX_AGENT_STORAGE / 1024 / 1024} MB`,
            );
        }

        const safeFilename = sanitizeFilename(file.originalname);
        const s3Key = `agents/${agentId}/${Date.now()}-${safeFilename}`;

        await this.storage.put(s3Key, file.buffer, file.mimetype);

        const document = await this.documentRepository.create({
            agentId,
            storageKey: s3Key,
            mimeType: file.mimetype,
            name: safeFilename,
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

    async get(id: string, agentId: string) {
        const doc = await this.documentRepository.findById(id, agentId);
        if (!doc) throw new NotFoundException('Document not found');
        return doc;
    }

    async getUrl(id: string, agentId: string) {
        const doc = await this.documentRepository.findById(id, agentId);
        if (!doc) throw new NotFoundException('Document not found');
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

    async getContent(id: string, agentId: string): Promise<string> {
        const doc = await this.documentRepository.findById(id, agentId);
        if (!doc) throw new NotFoundException('Document not found');
        const buffer = await this.storage.get(doc.storageKey);
        return buffer.toString('utf-8');
    }

    async retry(id: string, agentId: string) {
        const doc = await this.documentRepository.findById(id, agentId);
        if (!doc) throw new NotFoundException('Document not found');

        await this._checkRetryAllowed(id, agentId);

        await this.documentRepository.resetForRetry(id);

        const payload: IndexDocumentCommandProps = {
            documentId: doc.id,
            agentId,
            storageKey: doc.storageKey,
            mimeType: doc.mimeType,
            name: doc.name,
            buffer: null,
        };

        await this.documentQueue.add(INDEX_DOCUMENT_JOB, payload, {
            attempts: 5,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
        });

        return { id };
    }

    private async _checkRetryAllowed(documentId: string, agentId: string): Promise<void> {
        const doc = await this.documentRepository.findById(documentId, agentId);
        if (!doc) throw new NotFoundException('Document not found');

        const documentRetryAge = Date.now() - doc.updatedAt.getTime();
        const resendIntervalMs = ms(
            this.configService.getOrThrow<string>('DOCUMENT_INDEXING_RETRY_INTERVAL') as ms.StringValue,
        );

        if (documentRetryAge < resendIntervalMs) {
            const remaniningTime = ms(resendIntervalMs - documentRetryAge, { long: true });
            throw new BadRequestException(
                `Re-indexion impossible pour le moment. Veuillez réessayer dans ${remaniningTime}.`,
            );
        }
    }

    async delete(id: string, agentId: string): Promise<void> {
        const doc = await this.documentRepository.findById(id, agentId);
        if (!doc) throw new NotFoundException('Document not found');
        await this.ragEngineService.deleteDocument(doc.name, agentId);
        await this.storage.delete(doc.storageKey);
        await this.documentRepository.delete(id);
    }
}
