import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';

describe('RagEngineService', () => {
    const httpService = { get: jest.fn() as any };
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
});
