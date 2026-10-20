import { AxiosError, AxiosHeaders } from 'axios';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Job } from 'bullmq';
import { DatasetCleanupProcessor } from 'src/dataset/dataset-cleanup.processor';
import { DatasetCleanupJob } from 'src/dataset/dataset.types';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { IStorageStrategy } from 'src/storage/storage.strategy';

const axiosError = (status: number) =>
    new AxiosError(String(status), String(status), undefined, undefined, {
        status,
        statusText: '',
        data: {},
        headers: {},
        config: { headers: new AxiosHeaders() },
    });

const job = {
    data: {
        workspaceId: 'ws-1',
        datasetId: 'dataset-1',
        documents: [
            { name: 'a.pdf', storageKey: 'key-a' },
            { name: 'b.pdf', storageKey: 'key-b' },
        ],
    },
} as Job<DatasetCleanupJob>;

describe('DatasetCleanupProcessor', () => {
    const ragEngineService = { deleteDataset: jest.fn<any>() };
    const storage = { delete: jest.fn<any>() };
    const processor = new DatasetCleanupProcessor(
        ragEngineService as unknown as RagEngineService,
        storage as unknown as IStorageStrategy,
    );

    beforeEach(() => {
        jest.clearAllMocks();
        storage.delete.mockResolvedValue(undefined);
    });

    it('drops the dataset in the workspace org of the RAG engine, then every stored file', async () => {
        ragEngineService.deleteDataset.mockResolvedValue(undefined);

        await processor.process(job);

        expect(ragEngineService.deleteDataset).toHaveBeenCalledWith('ws-1', 'dataset-1');
        expect(storage.delete.mock.calls).toEqual([['key-a'], ['key-b']]);
    });

    it('still deletes the files when the engine has nothing for the dataset (404)', async () => {
        ragEngineService.deleteDataset.mockRejectedValue(axiosError(404));

        await processor.process(job);

        expect(storage.delete).toHaveBeenCalledTimes(2);
    });

    it('fails the job and keeps the files when the engine errors, so a retry can drop the vectors', async () => {
        ragEngineService.deleteDataset.mockRejectedValue(axiosError(500));

        await expect(processor.process(job)).rejects.toBeInstanceOf(AxiosError);
        expect(storage.delete).not.toHaveBeenCalled();
    });
});
