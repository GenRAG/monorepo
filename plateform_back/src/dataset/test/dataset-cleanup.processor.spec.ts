import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { AxiosError, AxiosHeaders } from 'axios';
import { Job } from 'bullmq';
import { DatasetCleanupProcessor } from 'src/dataset/dataset-cleanup.processor';
import { DatasetCleanupJob } from 'src/dataset/dataset.types';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { IStorageStrategy } from 'src/storage/storage.strategy';

const mockRagEngineService = { deleteDocument: jest.fn() as any };
const mockStorage = { delete: jest.fn() as any };

const job = (data: DatasetCleanupJob) => ({ data }) as Job<DatasetCleanupJob>;

describe('DatasetCleanupProcessor', () => {
    let processor: DatasetCleanupProcessor;

    beforeEach(() => {
        jest.clearAllMocks();
        processor = new DatasetCleanupProcessor(
            mockRagEngineService as unknown as RagEngineService,
            mockStorage as unknown as IStorageStrategy,
        );
    });

    it("should delete each document's vectors in the workspace collection, then its file", async () => {
        await processor.process(
            job({
                workspaceId: 'workspace-1',
                datasetId: 'dataset-1',
                documents: [{ name: 'a.pdf', storageKey: 'datasets/dataset-1/1-a.pdf' }],
            }),
        );

        expect(mockRagEngineService.deleteDocument).toHaveBeenCalledWith(
            { orgId: 'workspace-1', datasetId: 'dataset-1' },
            'a.pdf',
        );
        expect(mockStorage.delete).toHaveBeenCalledWith('datasets/dataset-1/1-a.pdf');
    });

    it('should still delete the file of a document the engine never indexed (404)', async () => {
        mockRagEngineService.deleteDocument.mockRejectedValue(
            new AxiosError('Not found', '404', undefined, undefined, {
                status: 404,
                statusText: 'Not Found',
                headers: {},
                config: { headers: new AxiosHeaders() },
                data: {},
            }),
        );

        await processor.process(
            job({
                workspaceId: 'workspace-1',
                datasetId: 'dataset-1',
                documents: [{ name: 'a.pdf', storageKey: 'k' }],
            }),
        );

        expect(mockStorage.delete).toHaveBeenCalledWith('k');
    });

    it('should only delete the files of a job queued before workspaceId existed', async () => {
        await processor.process(
            job({ datasetId: 'dataset-1', documents: [{ name: 'a.pdf', storageKey: 'k' }] } as DatasetCleanupJob),
        );

        expect(mockRagEngineService.deleteDocument).not.toHaveBeenCalled();
        expect(mockStorage.delete).toHaveBeenCalledWith('k');
    });
});
