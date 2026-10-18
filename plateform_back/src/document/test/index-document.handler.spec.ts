import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DocumentStatus, Prisma } from 'generated/prisma';
import { IndexDocumentHandler } from 'src/document/handlers/index-document.handler';
import { DocumentRepository } from 'src/document/document.repository';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';

const mockDocumentRepository = {
    updateStatus: jest.fn() as any,
    findEngineScope: jest.fn() as any,
    findByName: jest.fn() as any,
};
const mockRagEngineService = { indexDocument: jest.fn() as any, deleteDocument: jest.fn() as any };

const recordNotFound = () =>
    new Prisma.PrismaClientKnownRequestError('Record to update not found.', { code: 'P2025', clientVersion: 'test' });

const command = {
    documentId: 'doc-1',
    datasetId: 'dataset-1',
    storageKey: 'k',
    mimeType: 'application/pdf',
    name: 'a.pdf',
    buffer: Buffer.from('hi').toString('base64'),
};
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
        mockDocumentRepository.findEngineScope.mockResolvedValue({ orgId: 'workspace-1', datasetId: 'dataset-1' });
    });

    it("should index the document in its workspace's collection and its dataset", async () => {
        await handler.execute({
            documentId: 'doc-1',
            datasetId: 'dataset-1',
            storageKey: 'k',
            mimeType: 'application/pdf',
            name: 'a.pdf',
            buffer: Buffer.from('hi').toString('base64'),
        });

        expect(mockRagEngineService.indexDocument).toHaveBeenCalledWith(
            { orgId: 'workspace-1', datasetId: 'dataset-1' },
            'a.pdf',
            Buffer.from('hi'),
            'application/pdf',
        );
        expect(mockDocumentRepository.findEngineScope).toHaveBeenCalledWith('dataset-1');
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
            { orgId: 'workspace-1', datasetId: 'dataset-1' },
            'a.pdf',
            Buffer.from('big'),
            'application/pdf',
        );
    });

    describe('document deleted while it was being indexed', () => {
        it('should delete the vectors the engine just stored, so the agent cannot cite it', async () => {
            mockDocumentRepository.updateStatus.mockResolvedValueOnce({}).mockRejectedValueOnce(recordNotFound());
            mockDocumentRepository.findByName.mockResolvedValue(null);

            await expect(handler.execute(command)).resolves.toBeUndefined();

            expect(mockRagEngineService.deleteDocument).toHaveBeenCalledWith(
                { orgId: 'workspace-1', datasetId: 'dataset-1' },
                'a.pdf',
            );
        });

        it('should keep the vectors when a new document with the same name has been added since', async () => {
            mockDocumentRepository.updateStatus.mockResolvedValueOnce({}).mockRejectedValueOnce(recordNotFound());
            mockDocumentRepository.findByName.mockResolvedValue({ id: 'doc-2', name: 'a.pdf' });

            await expect(handler.execute(command)).resolves.toBeUndefined();

            expect(mockRagEngineService.deleteDocument).not.toHaveBeenCalled();
        });

        it('should not index a document deleted before its job started', async () => {
            mockDocumentRepository.updateStatus.mockRejectedValueOnce(recordNotFound());

            await expect(handler.execute(command)).resolves.toBeUndefined();

            expect(mockRagEngineService.indexDocument).not.toHaveBeenCalled();
        });

        it('should drop the vectors with the scope read before indexing, even if the dataset is gone since', async () => {
            mockDocumentRepository.updateStatus.mockResolvedValueOnce({}).mockRejectedValueOnce(recordNotFound());
            mockDocumentRepository.findByName.mockResolvedValue(null);

            await handler.execute(command);

            expect(mockDocumentRepository.findEngineScope).toHaveBeenCalledTimes(1);
            expect(mockRagEngineService.deleteDocument).toHaveBeenCalledWith(
                { orgId: 'workspace-1', datasetId: 'dataset-1' },
                'a.pdf',
            );
        });

        it('should stop without error when the document and its dataset were deleted before the job started', async () => {
            mockDocumentRepository.updateStatus.mockRejectedValueOnce(recordNotFound());
            mockDocumentRepository.findByName.mockResolvedValue(null);
            mockDocumentRepository.findEngineScope.mockRejectedValueOnce(recordNotFound());

            await expect(handler.execute(command)).resolves.toBeUndefined();
            expect(mockRagEngineService.deleteDocument).not.toHaveBeenCalled();
        });

        it('should not fail the job again when marking a deleted document as FAILED', async () => {
            mockDocumentRepository.updateStatus.mockRejectedValueOnce(recordNotFound());

            await expect(handler.failed(command, 'boom')).resolves.toBeUndefined();
        });
    });
});
