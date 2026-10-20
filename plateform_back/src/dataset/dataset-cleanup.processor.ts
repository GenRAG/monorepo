import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AxiosError } from 'axios';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DATASET_CLEANUP_QUEUE } from './dataset.service';
import { DatasetCleanupJob } from './dataset.types';

/** A 404 from the RAG engine means nothing of the dataset was indexed (or it was already removed). */
@Injectable()
@Processor(DATASET_CLEANUP_QUEUE, { concurrency: 1 })
export class DatasetCleanupProcessor extends WorkerHost {
    private readonly logger = new Logger(DatasetCleanupProcessor.name);

    constructor(
        private readonly ragEngineService: RagEngineService,
        @Inject('STORAGE_STRATEGY')
        private readonly storage: IStorageStrategy,
    ) {
        super();
    }

    async process(job: Job<DatasetCleanupJob>): Promise<void> {
        const { workspaceId, datasetId, documents } = job.data;

        try {
            await this.ragEngineService.deleteDataset(workspaceId, datasetId);
        } catch (error) {
            if (!(error instanceof AxiosError && error.response?.status === 404)) throw error;
        }

        for (const document of documents) {
            await this.storage.delete(document.storageKey);
        }

        this.logger.log(`Dataset ${datasetId} cleaned up (${documents.length} documents)`);
    }
}
