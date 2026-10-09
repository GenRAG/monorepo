import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosHeaders } from 'axios';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DocumentSource } from 'generated/prisma';
import { DocumentService } from 'src/document/document.service';
import { DocumentRepository } from 'src/document/document.repository';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';

const mockStorage = {
    put: jest.fn() as any,
    get: jest.fn() as any,
    delete: jest.fn() as any,
    getSignedUrl: jest.fn() as any,
};

const mockDocumentRepository = {
    create: jest.fn() as any,
    findById: jest.fn() as any,
    findByName: jest.fn() as any,
    getTotalSize: jest.fn() as any,
    touchDataset: jest.fn() as any,
    delete: jest.fn() as any,
    findByDatasetPaginated: jest.fn() as any,
};

const mockRagEngineService = {
    deleteDocument: jest.fn() as any,
};

const mockQueue = {
    add: jest.fn() as any,
};

const file = {
    buffer: Buffer.from('hello'),
    filename: 'Mon rapport.pdf',
    mimeType: 'application/pdf',
    size: 5,
};

describe('DocumentService', () => {
    let service: DocumentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DocumentService,
                { provide: 'STORAGE_STRATEGY', useValue: mockStorage },
                {
                    provide: DocumentRepository,
                    useValue: mockDocumentRepository,
                },
                {
                    provide: ConfigService,
                    useValue: { getOrThrow: jest.fn(() => '1m') },
                },
                { provide: RagEngineService, useValue: mockRagEngineService },
                { provide: getQueueToken('documents'), useValue: mockQueue },
            ],
        }).compile();

        service = module.get<DocumentService>(DocumentService);
        jest.clearAllMocks();
        mockDocumentRepository.getTotalSize.mockResolvedValue(0);
        mockDocumentRepository.findByName.mockResolvedValue(null);
        mockDocumentRepository.create.mockImplementation((data: Record<string, unknown>) =>
            Promise.resolve({ id: 'doc-1', ...data }),
        );
    });

    describe('ingestFile', () => {
        it('should store the file under the dataset, create the document as UPLOAD and enqueue it', async () => {
            await service.ingestFile('dataset-1', file);

            const [storageKey] = mockStorage.put.mock.calls[0] as [string];
            expect(storageKey).toMatch(/^datasets\/dataset-1\/\d+-Mon_rapport\.pdf$/);
            expect(mockDocumentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    datasetId: 'dataset-1',
                    name: 'Mon_rapport.pdf',
                    source: DocumentSource.UPLOAD,
                }),
            );
            expect(mockQueue.add).toHaveBeenCalledWith(
                'index-document',
                expect.objectContaining({
                    documentId: 'doc-1',
                    datasetId: 'dataset-1',
                    storageKey,
                }),
                expect.any(Object),
            );
        });

        it('should keep the provenance given by a connector', async () => {
            const externalModifiedAt = new Date();

            await service.ingestFile('dataset-1', file, {
                source: DocumentSource.GOOGLE_DRIVE,
                externalId: 'drive-123',
                externalUrl: 'https://drive.example/123',
                externalModifiedAt,
            });

            expect(mockDocumentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: DocumentSource.GOOGLE_DRIVE,
                    externalId: 'drive-123',
                    externalModifiedAt,
                }),
            );
        });

        it('should refuse a file whose name already exists in the dataset', async () => {
            mockDocumentRepository.findByName.mockResolvedValue({
                id: 'doc-0',
            });

            await expect(service.ingestFile('dataset-1', file)).rejects.toThrow(ConflictException);
            expect(mockStorage.put).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should throw NotFoundException for a document of another dataset', async () => {
            mockDocumentRepository.findById.mockResolvedValue(null);

            await expect(service.delete('doc-1', 'dataset-2')).rejects.toThrow(NotFoundException);
        });

        it('should delete the vectors with org_id = datasetId, then the file and the row', async () => {
            mockDocumentRepository.findById.mockResolvedValue({
                id: 'doc-1',
                name: 'a.pdf',
                storageKey: 'k',
            });

            await service.delete('doc-1', 'dataset-1');

            expect(mockRagEngineService.deleteDocument).toHaveBeenCalledWith('a.pdf', 'dataset-1');
            expect(mockStorage.delete).toHaveBeenCalledWith('k');
            expect(mockDocumentRepository.delete).toHaveBeenCalledWith('doc-1');
        });

        it('should still delete a document the engine never indexed (404)', async () => {
            mockDocumentRepository.findById.mockResolvedValue({
                id: 'doc-1',
                name: 'a.pdf',
                storageKey: 'k',
            });
            mockRagEngineService.deleteDocument.mockRejectedValue(
                new AxiosError('Not found', '404', undefined, undefined, {
                    status: 404,
                    statusText: 'Not Found',
                    data: {},
                    headers: {},
                    config: { headers: new AxiosHeaders() },
                }),
            );

            await service.delete('doc-1', 'dataset-1');

            expect(mockDocumentRepository.delete).toHaveBeenCalledWith('doc-1');
        });
    });

    describe('getByDatasetPaginated', () => {
        it('should pass the source filters and cap the page size', async () => {
            await service.getByDatasetPaginated('dataset-1', 2, 500, [DocumentSource.NOTION, DocumentSource.UPLOAD]);

            expect(mockDocumentRepository.findByDatasetPaginated).toHaveBeenCalledWith('dataset-1', 2, 100, [
                DocumentSource.NOTION,
                DocumentSource.UPLOAD,
            ]);
        });

        it('should convert query-string page and limit to numbers', async () => {
            await service.getByDatasetPaginated('dataset-1', '3' as unknown as number, '8' as unknown as number);

            expect(mockDocumentRepository.findByDatasetPaginated).toHaveBeenCalledWith('dataset-1', 3, 8, undefined);
        });
    });
});
