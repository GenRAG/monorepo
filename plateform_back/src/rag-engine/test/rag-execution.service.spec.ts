import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import type FormData from 'form-data';

describe('RagEngineService', () => {
    const httpService = { get: jest.fn() as any, post: jest.fn() as any, delete: jest.fn() as any };
    const configService = {
        getOrThrow: (key: string) => ({ RAGENGINE_URL: 'http://rag.local', RAGENGINE_API_KEY: 'secret' })[key],
    } as unknown as ConfigService;

    let service: RagEngineService;

    beforeEach(() => {
        jest.clearAllMocks();
        httpService.get.mockReturnValue(of({ data: { id: 'model' } }));
        service = new RagEngineService(configService, httpService as unknown as HttpService);
    });

    describe('getModelInfo', () => {
        it.each(['openai/gpt-4o', 'meta-llama/llama-3.1-8b-instruct:free', 'zerank-1', 'qwen/qwen3.5-72b_v2'])(
            'should forward the model id %s unchanged to the RAG engine',
            async (modelId) => {
                await service.getModelInfo(modelId);

                expect(httpService.get).toHaveBeenCalledWith(`http://rag.local/models/${modelId}/info`, {
                    headers: { 'X-API-Key': 'secret' },
                    timeout: 10_000,
                });
            },
        );

        it.each([
            '../job/some-job-id/result',
            'openai/../../documents',
            'openai/gpt-4o?x=1',
            'openai/gpt-4o#',
            'openai%2F..%2Fjob',
            '/models',
            'openai//gpt-4o',
            'openai/gpt 4o',
            'openai\\gpt-4o',
        ])('should reject %s without calling the RAG engine', async (modelId) => {
            await expect(service.getModelInfo(modelId)).rejects.toThrow(BadRequestException);
            expect(httpService.get).not.toHaveBeenCalled();
        });
    });

    describe('indexDocument', () => {
        it('should poll the ingestion job status with the API key until it completes', async () => {
            jest.useFakeTimers();
            httpService.post.mockReturnValue(of({ data: { job_id: 'job-1' } }));
            httpService.get.mockReturnValue(of({ data: { status: 'completed' } }));

            const indexing = service.indexDocument(
                { orgId: 'workspace-1', datasetId: 'dataset-1' },
                'a.pdf',
                Buffer.from('%PDF-'),
                'application/pdf',
            );
            await jest.advanceTimersByTimeAsync(2_000);
            await indexing;
            jest.useRealTimers();

            expect(httpService.get).toHaveBeenCalledWith('http://rag.local/job/job-1/status', {
                headers: { 'X-API-Key': 'secret' },
                timeout: 10_000,
            });
        });

        it('should send the workspace as org_id and the dataset as dataset_id', async () => {
            jest.useFakeTimers();
            httpService.post.mockReturnValue(of({ data: { job_id: 'job-1' } }));
            httpService.get.mockReturnValue(of({ data: { status: 'completed' } }));

            const indexing = service.indexDocument(
                { orgId: 'workspace-1', datasetId: 'dataset-1' },
                'a.pdf',
                Buffer.from('%PDF-'),
                'application/pdf',
            );
            await jest.advanceTimersByTimeAsync(2_000);
            await indexing;
            jest.useRealTimers();

            const [url, form] = httpService.post.mock.calls[0] as [string, FormData];
            const body = form.getBuffer().toString();
            expect(url).toBe('http://rag.local/ingest');
            expect(body).toMatch(/name="org_id"\r\n\r\nworkspace-1\r\n/);
            expect(body).toMatch(/name="dataset_id"\r\n\r\ndataset-1\r\n/);
        });
    });

    describe('getQueryStream', () => {
        const pipeline = [{ name: 'query', type: 'query' as const }];

        it('should post { pipeline: { blocks }, query, org_id } to /rag/stream', async () => {
            httpService.post.mockReturnValue(of({ data: 'stream' }));

            await service.getQueryStream({ pipeline, query: 'q', orgId: 'workspace-1' });

            expect(httpService.post).toHaveBeenCalledWith(
                'http://rag.local/rag/stream',
                { pipeline: { blocks: pipeline }, query: 'q', org_id: 'workspace-1' },
                expect.objectContaining({ responseType: 'stream' }),
            );
        });

        it('should post the same body to /rag/stream/mock in mock mode', async () => {
            httpService.post.mockReturnValue(of({ data: 'stream' }));

            await service.getQueryStream({ pipeline, query: 'q', orgId: 'workspace-1', mock: true });

            expect(httpService.post).toHaveBeenCalledWith(
                'http://rag.local/rag/stream/mock',
                { pipeline: { blocks: pipeline }, query: 'q', org_id: 'workspace-1' },
                expect.objectContaining({ responseType: 'stream' }),
            );
        });
    });

    describe('deleteDocument', () => {
        it('should accept a delete whose stored copy was already gone', async () => {
            httpService.delete.mockReturnValue(of({ data: { status: 'deleted', file_deleted: false } }));

            await expect(
                service.deleteDocument({ orgId: 'workspace-1', datasetId: 'dataset-1' }, 'a.pdf'),
            ).resolves.toBeUndefined();
        });

        it('should delete the file of the dataset in the workspace collection', async () => {
            httpService.delete.mockReturnValue(of({ data: { status: 'deleted', file_deleted: true } }));

            await service.deleteDocument({ orgId: 'workspace-1', datasetId: 'dataset-1' }, 'a.pdf');

            expect(httpService.delete).toHaveBeenCalledWith('http://rag.local/documents', {
                headers: { 'X-API-Key': 'secret', 'Content-Type': 'application/json' },
                data: { filename: 'a.pdf', org_id: 'workspace-1', dataset_id: 'dataset-1' },
                timeout: 30_000,
            });
        });
    });
});
