import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DocumentStatus } from 'generated/prisma';
import { IndexDocumentHandler } from 'src/document/handlers/index-document.handler';
import { DocumentRepository } from 'src/document/document.repository';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';

const mockDocumentRepository = { updateStatus: jest.fn() as any };
const mockRagEngineService = { indexDocument: jest.fn() as any };
const mockStorage = { get: jest.fn() as any };

describe('IndexDocumentHandler', () => {
    let handler: IndexDocumentHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IndexDocumentHandler,
                {
                    provide: DocumentRepository,
                    useValue: mockDocumentRepository,
                },
                { provide: RagEngineService, useValue: mockRagEngineService },
                { provide: 'STORAGE_STRATEGY', useValue: mockStorage },
            ],
        }).compile();

        handler = module.get<IndexDocumentHandler>(IndexDocumentHandler);
        jest.clearAllMocks();
    });

    it('should index the document with org_id = datasetId', async () => {
        await handler.execute({
            documentId: 'doc-1',
            datasetId: 'dataset-1',
            storageKey: 'k',
            mimeType: 'application/pdf',
            name: 'a.pdf',
            buffer: Buffer.from('hi').toString('base64'),
        });

        expect(mockRagEngineService.indexDocument).toHaveBeenCalledWith(
            'a.pdf',
            'dataset-1',
            Buffer.from('hi'),
            'application/pdf',
        );
        expect(mockDocumentRepository.updateStatus).toHaveBeenLastCalledWith('doc-1', DocumentStatus.INDEXED, {
            indexedAt: expect.any(Date),
        });
    });

    it('should read the file from storage when it was not inlined', async () => {
        mockStorage.get.mockResolvedValue(Buffer.from('big'));

        await handler.execute({
            documentId: 'doc-1',
            datasetId: 'dataset-1',
            storageKey: 'k',
            mimeType: 'application/pdf',
            name: 'a.pdf',
            buffer: null,
        });

        expect(mockStorage.get).toHaveBeenCalledWith('k');
        expect(mockRagEngineService.indexDocument).toHaveBeenCalledWith(
            'a.pdf',
            'dataset-1',
            Buffer.from('big'),
            'application/pdf',
        );
    });
});
