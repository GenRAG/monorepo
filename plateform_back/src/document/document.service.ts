import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AxiosError } from 'axios';
import { Document, DocumentSource, DocumentStatus, Prisma } from 'generated/prisma';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DocumentRepository } from './document.repository';
import { IndexDocumentCommandProps } from './commands/index-document.command';
import { ConfigService } from '@nestjs/config';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { sanitizeFilename } from 'src/lib/filename.util';
import ms from 'ms';
import { MAX_DATASET_STORAGE_BYTES } from 'src/dataset/dataset.constants';
import { matchesDeclaredType } from 'src/lib/file-signature.util';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './document.constants';

const MAX_TEXT_CONTENT_BYTES = 2 * 1024 * 1024;
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
     * Every rule `ingestFile` applies before storing anything. `replacing` is a document of the dataset that the
     * file replaces (connector resync): its name and its size do not count, so it can be checked before the delete.
     */
    async assertIngestable(
        datasetId: string,
        file: IngestFileInput,
        replacing?: Pick<Document, 'id' | 'size'>,
    ): Promise<void> {
        // Validated here rather than in the controller: connector files are untrusted bytes too.
        if (file.buffer.length === 0) throw new BadRequestException('Le fichier est vide');
        if (file.buffer.length > MAX_FILE_SIZE) {
            throw new BadRequestException(`Le fichier dépasse ${MAX_FILE_SIZE / 1024 / 1024} Mo`);
        }
        if (!ALLOWED_MIME_TYPES.has(file.mimeType)) throw new BadRequestException('Type de fichier non supporté');
        if (!matchesDeclaredType(file.buffer, file.mimeType)) {
            throw new BadRequestException('Le contenu du fichier ne correspond pas à son type');
        }

        const usedStorage = (await this.documentRepository.getTotalSize(datasetId)) - (replacing?.size ?? 0);
        if (usedStorage + file.size > MAX_DATASET_STORAGE_BYTES) {
            throw new BadRequestException(
                `Espace de stockage plein : une base de connaissances ne peut pas dépasser ${MAX_DATASET_STORAGE_BYTES / 1024 / 1024} Mo`,
            );
        }

        const safeFilename = sanitizeFilename(file.filename);

        // The RAG engine identifies a document of a dataset by its filename: two files with the same name would collide.
        const sameName = await this.documentRepository.findByName(datasetId, safeFilename);
        if (sameName && sameName.id !== replacing?.id) {
            throw new ConflictException(`Un document nommé « ${safeFilename} » existe déjà dans cette base`);
        }
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
        await this.assertIngestable(datasetId, file);
        const safeFilename = sanitizeFilename(file.filename);

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
        // Only text files have a readable content: a PDF or DOCX would come back as binary garbage.
        if (!doc.mimeType.startsWith('text/') || doc.size > MAX_TEXT_CONTENT_BYTES) {
            throw new BadRequestException("L'aperçu texte n'est pas disponible pour ce document");
        }
        const buffer = await this.storage.get(doc.storageKey);
        return buffer.toString('utf-8');
    }

    async retry(id: string, datasetId: string) {
        const doc = await this.documentRepository.findById(id, datasetId);
        if (!doc) throw new NotFoundException('Document not found');
        // Any other status already has a job (or its vectors): queueing one more would index it twice.
        if (doc.status !== DocumentStatus.FAILED) {
            throw new ConflictException('Seul un document en échec peut être réindexé');
        }

        this._checkRetryAllowed(doc.updatedAt);

        // Conditional on FAILED, so two retries at once queue a single job.
        const { count } = await this.documentRepository.resetForRetry(id);
        if (count === 0) throw new ConflictException('Seul un document en échec peut être réindexé');

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
            await this.ragEngineService.deleteDocument(
                await this.documentRepository.findEngineScope(datasetId),
                doc.name,
            );
        } catch (error) {
            // 404: the document never reached the vector store (failed or still pending indexing).
            if (!(error instanceof AxiosError && error.response?.status === 404)) throw error;
        }

        await this.storage.delete(doc.storageKey);
        await this.documentRepository.delete(id);
        await this.documentRepository.touchDataset(datasetId);
    }
}
