import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AxiosError } from 'axios';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { DATASET_CLEANUP_QUEUE, WORKSPACE_CLEANUP_JOB } from './dataset.service';
import { DatasetCleanupJob, WorkspaceCleanupJob } from './dataset.types';

/**
 * Vectors are deleted document by document, in the workspace's collection (`org_id`) and the dataset.
 * A 404 from the engine means the document was never indexed (or already removed) and is not an error.
 */
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

    async process(job: Job<DatasetCleanupJob | WorkspaceCleanupJob>): Promise<void> {
        if (job.name === WORKSPACE_CLEANUP_JOB) {
            return this.cleanUpWorkspace(job.data as WorkspaceCleanupJob);
        }
        const { workspaceId, datasetId, documents } = job.data as DatasetCleanupJob;

        for (const document of documents) {
            // Jobs queued before the engine kept one collection per workspace carry no workspaceId.
            if (workspaceId) {
                try {
                    await this.ragEngineService.deleteDocument({ orgId: workspaceId, datasetId }, document.name);
                } catch (error) {
                    if (!(error instanceof AxiosError && error.response?.status === 404)) throw error;
                }
            }
            await this.storage.delete(document.storageKey);
        }

        this.logger.log(`Dataset ${datasetId} cleaned up (${documents.length} documents)`);
    }

    /** The whole collection goes at once, then the files of every document the workspace had. */
    private async cleanUpWorkspace({ workspaceId, storageKeys }: WorkspaceCleanupJob): Promise<void> {
        try {
            await this.ragEngineService.deleteOrg(workspaceId);
        } catch (error) {
            if (!(error instanceof AxiosError && error.response?.status === 404)) throw error;
        }
        for (const storageKey of storageKeys) {
            await this.storage.delete(storageKey);
        }

        this.logger.log(`Workspace ${workspaceId} cleaned up (${storageKeys.length} files)`);
    }
}
