import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AxiosError } from 'axios';
import { DocumentSource, Prisma } from 'generated/prisma';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DocumentRepository } from './document.repository';
import { IndexDocumentCommandProps } from './commands/index-document.command';
import { ConfigService } from '@nestjs/config';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { sanitizeFilename } from 'src/lib/filename.util';
import ms from 'ms';
import { MAX_DATASET_STORAGE_BYTES } from 'src/dataset/dataset.constants';

const SMALL_FILE_THRESHOLD = 5 * 1024 * 1024;
const INDEX_DOCUMENT_JOB = 'index-document';
const INDEX_JOB_OPTIONS = {
    attempts: 5,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: true,
    removeOnFail: false,
};

export interface IngestFileInput {
    buffer: Buffer;
    filename: string;
    mimeType: string;
    size: number;
}

export interface DocumentOrigin {
    source: DocumentSource;
    externalId?: string;
    externalUrl?: string;
    externalModifiedAt?: Date;
}

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

    upload(file: Express.Multer.File, datasetId: string) {
        return this.ingestFile(
            datasetId,
            {
                buffer: file.buffer,
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            },
            { source: DocumentSource.UPLOAD },
        );
    }

    /**
     * Single entry point to add a file to a dataset: S3 upload, Document row, indexing job.
     * Manual uploads and future connectors both go through here.
     */
    async ingestFile(
        datasetId: string,
        file: IngestFileInput,
        origin: DocumentOrigin = { source: DocumentSource.UPLOAD },
    ) {
        const usedStorage = await this.documentRepository.getTotalSize(datasetId);
        if (usedStorage + file.size > MAX_DATASET_STORAGE_BYTES) {
            throw new BadRequestException(
                `Espace de stockage plein : une base de connaissances ne peut pas dépasser ${MAX_DATASET_STORAGE_BYTES / 1024 / 1024} Mo`,
            );
        }

        const safeFilename = sanitizeFilename(file.filename);

        // The RAG engine identifies a document by (org_id, filename): two files with the same name would collide.
        if (await this.documentRepository.findByName(datasetId, safeFilename)) {
            throw new ConflictException(`Un document nommé « ${safeFilename} » existe déjà dans cette base`);
        }

        const storageKey = `datasets/${datasetId}/${Date.now()}-${safeFilename}`;
        await this.storage.put(storageKey, file.buffer, file.mimeType);

        let document;
        try {
            document = await this.documentRepository.create({
                datasetId,
                storageKey,
                mimeType: file.mimeType,
                name: safeFilename,
                size: file.size,
                ...origin,
            });
        } catch (error) {
            // Never leave the uploaded file behind; a concurrent upload of the same name hits the unique index.
            await this.storage.delete(storageKey);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException(`Un document nommé « ${safeFilename} » existe déjà dans cette base`);
            }
            throw error;
        }
        await this.documentRepository.touchDataset(datasetId);

        await this.documentQueue.add(
            INDEX_DOCUMENT_JOB,
            {
                documentId: document.id,
                datasetId,
                storageKey,
                mimeType: file.mimeType,
                name: document.name,
                buffer: file.size < SMALL_FILE_THRESHOLD ? file.buffer.toString('base64') : null,
            },
            INDEX_JOB_OPTIONS,
        );

        return document;
    }

    async get(id: string, datasetId: string) {
        const doc = await this.documentRepository.findById(id, datasetId);
        if (!doc) throw new NotFoundException('Document not found');
        return doc;
    }

    async getUrl(id: string, datasetId: string) {
        const doc = await this.documentRepository.findById(id, datasetId);
        if (!doc) throw new NotFoundException('Document not found');
        const url = await this.storage.getSignedUrl(doc.storageKey, 900);
        return { url };
    }

    getByDataset(datasetId: string, sources?: DocumentSource[]) {
        return this.documentRepository.findByDataset(datasetId, sources);
    }

    getStats(datasetId: string) {
        return this.documentRepository.getStats(datasetId);
    }

    getByDatasetPaginated(datasetId: string, page: number, limit: number, sources?: DocumentSource[]) {
        return this.documentRepository.findByDatasetPaginated(
            datasetId,
            Number(page),
            Math.min(Number(limit), 100),
            sources,
        );
    }

    async getContent(id: string, datasetId: string): Promise<string> {
        const doc = await this.documentRepository.findById(id, datasetId);
        if (!doc) throw new NotFoundException('Document not found');
        const buffer = await this.storage.get(doc.storageKey);
        return buffer.toString('utf-8');
    }

    async retry(id: string, datasetId: string) {
        const doc = await this.documentRepository.findById(id, datasetId);
        if (!doc) throw new NotFoundException('Document not found');

        this._checkRetryAllowed(doc.updatedAt);

        await this.documentRepository.resetForRetry(id);

        await this.documentQueue.add(
            INDEX_DOCUMENT_JOB,
            {
                documentId: doc.id,
                datasetId,
                storageKey: doc.storageKey,
                mimeType: doc.mimeType,
                name: doc.name,
                buffer: null,
            },
            INDEX_JOB_OPTIONS,
        );

        return { id };
    }

    private _checkRetryAllowed(updatedAt: Date): void {
        const documentRetryAge = Date.now() - updatedAt.getTime();
        const resendIntervalMs = ms(
            this.configService.getOrThrow<string>('DOCUMENT_INDEXING_RETRY_INTERVAL') as ms.StringValue,
        );

        if (documentRetryAge < resendIntervalMs) {
            const remaniningTime = ms(resendIntervalMs - documentRetryAge, {
                long: true,
            });
            throw new BadRequestException(
                `Re-indexion impossible pour le moment. Veuillez réessayer dans ${remaniningTime}.`,
            );
        }
    }

    async delete(id: string, datasetId: string): Promise<void> {
        const doc = await this.documentRepository.findById(id, datasetId);
        if (!doc) throw new NotFoundException('Document not found');

        try {
            await this.ragEngineService.deleteDocument(doc.name, datasetId);
        } catch (error) {
            // 404: the document never reached the vector store (failed or still pending indexing).
            if (!(error instanceof AxiosError && error.response?.status === 404)) throw error;
        }

        await this.storage.delete(doc.storageKey);
        await this.documentRepository.delete(id);
        await this.documentRepository.touchDataset(datasetId);
    }
}
