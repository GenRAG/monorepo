import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AxiosError } from 'axios';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { IStorageStrategy } from 'src/storage/storage.strategy';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';
import { DATASET_CLEANUP_JOB, DATASET_CLEANUP_QUEUE, WORKSPACE_CLEANUP_JOB } from './dataset.service';
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
        private readonly workspaceRepository: WorkspaceRepository,
    ) {
        super();
    }

    async process(job: Job<DatasetCleanupJob | WorkspaceCleanupJob>): Promise<void> {
        switch (job.name) {
            case WORKSPACE_CLEANUP_JOB:
                return this.cleanUpWorkspace(job.data as WorkspaceCleanupJob);
            case DATASET_CLEANUP_JOB:
                return this.cleanUpDataset(job.data as DatasetCleanupJob);
            default:
                throw new Error(`Unknown cleanup job: ${job.name}`);
        }
    }

    private async cleanUpDataset({ workspaceId, datasetId, documents }: DatasetCleanupJob): Promise<void> {
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
        // The job is queued before the account delete commits: if that delete failed and the job could not be
        // removed, the workspace is still in use and its data must stay.
        if (await this.workspaceRepository.exists(workspaceId)) {
            this.logger.warn(`Workspace ${workspaceId} still exists, cleanup skipped`);
            return;
        }
        try {
            await this.ragEngineService.deleteOrg(workspaceId);
        } catch (error) {
            // Only the engine's own "nothing stored for this org" 404: an unknown route (engine without DELETE /orgs)
            // also answers 404, and would leave the vectors behind without a trace.
            const detail =
                error instanceof AxiosError ? (error.response?.data as { detail?: unknown })?.detail : undefined;
            const nothingStored =
                error instanceof AxiosError &&
                error.response?.status === 404 &&
                typeof detail === 'string' &&
                detail.startsWith('No data found');
            if (!nothingStored) throw error;
        }
        for (const storageKey of storageKeys) {
            await this.storage.delete(storageKey);
        }

        this.logger.log(`Workspace ${workspaceId} cleaned up (${storageKeys.length} files)`);
    }
}
