import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { DocumentSource } from 'generated/prisma';
import { DocumentService } from 'src/document/document.service';
import { ConnectorService } from 'src/connector/connector.service';
import {
    DriveAccessExpiredException,
    DriveFile,
    DriveFileUnavailableError,
    GoogleDriveClient,
} from 'src/connector/google-drive.client';

const mockDocumentService = {
    getByDataset: jest.fn() as any,
    ingestFile: jest.fn() as any,
    assertIngestable: jest.fn() as any,
    delete: jest.fn() as any,
};

const mockDrive = {
    getFile: jest.fn() as any,
    download: jest.fn() as any,
};

const driveFile = (overrides: Partial<DriveFile> = {}): DriveFile => ({
    id: 'drive-1',
    name: 'Rapport.pdf',
    mimeType: 'application/pdf',
    modifiedTime: '2026-10-10T10:00:00.000Z',
    webViewLink: 'https://drive.google.com/file/d/drive-1/view',
    size: '10',
    ...overrides,
});

const downloaded = {
    buffer: Buffer.from('%PDF-1'),
    filename: 'Rapport.pdf',
    mimeType: 'application/pdf',
    size: 6,
};

describe('ConnectorService', () => {
    let service: ConnectorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConnectorService,
                { provide: DocumentService, useValue: mockDocumentService },
                { provide: GoogleDriveClient, useValue: mockDrive },
            ],
        }).compile();

        service = module.get(ConnectorService);
        jest.clearAllMocks();
        mockDocumentService.getByDataset.mockResolvedValue([]);
        mockDrive.download.mockResolvedValue(downloaded);
    });

    describe('importFromGoogleDrive', () => {
        it('should ingest the picked file with its Drive provenance', async () => {
            mockDrive.getFile.mockResolvedValue(driveFile());

            const result = await service.importFromGoogleDrive('dataset-1', 'token', ['drive-1']);

            expect(result).toEqual({ imported: 1, failed: [] });
            expect(mockDocumentService.ingestFile).toHaveBeenCalledWith('dataset-1', downloaded, {
                source: DocumentSource.GOOGLE_DRIVE,
                externalId: 'drive-1',
                externalUrl: 'https://drive.google.com/file/d/drive-1/view',
                externalModifiedAt: new Date('2026-10-10T10:00:00.000Z'),
            });
        });

        it('should report, without downloading, a file already imported, unsupported or too large', async () => {
            mockDocumentService.getByDataset.mockResolvedValue([{ externalId: 'drive-1' }]);
            mockDrive.getFile.mockImplementation((_token: string, id: string) =>
                Promise.resolve(
                    {
                        'drive-1': driveFile(),
                        'drive-2': driveFile({
                            id: 'drive-2',
                            name: 'Budget',
                            mimeType: 'application/vnd.google-apps.spreadsheet',
                        }),
                        'drive-3': driveFile({
                            id: 'drive-3',
                            name: 'Gros.pdf',
                            size: String(16 * 1024 * 1024),
                        }),
                    }[id],
                ),
            );

            const result = await service.importFromGoogleDrive('dataset-1', 'token', ['drive-1', 'drive-2', 'drive-3']);

            expect(result.imported).toBe(0);
            expect(result.failed.map((f) => f.name)).toEqual(['Rapport.pdf', 'Budget', 'Gros.pdf']);
            expect(mockDrive.download).not.toHaveBeenCalled();
        });

        it('should keep importing the other files when one is no longer accessible', async () => {
            mockDrive.getFile
                .mockRejectedValueOnce(new DriveFileUnavailableError())
                .mockResolvedValueOnce(driveFile({ id: 'drive-2' }));

            const result = await service.importFromGoogleDrive('dataset-1', 'token', ['drive-1', 'drive-2']);

            expect(result.imported).toBe(1);
            expect(result.failed).toEqual([
                {
                    name: 'drive-1',
                    reason: expect.stringContaining('Inaccessible'),
                },
            ]);
        });

        it('should stop the whole run when the Google token expired', async () => {
            mockDrive.getFile.mockRejectedValue(new DriveAccessExpiredException());

            await expect(service.importFromGoogleDrive('dataset-1', 'token', ['drive-1', 'drive-2'])).rejects.toThrow(
                DriveAccessExpiredException,
            );
            expect(mockDrive.getFile).toHaveBeenCalledTimes(1);
        });

        it('should report the reason given by the ingestion (name conflict, storage full...)', async () => {
            mockDrive.getFile.mockResolvedValue(driveFile());
            mockDocumentService.ingestFile.mockRejectedValueOnce(new BadRequestException('Espace de stockage plein'));

            const result = await service.importFromGoogleDrive('dataset-1', 'token', ['drive-1']);

            expect(result.failed).toEqual([{ name: 'Rapport.pdf', reason: 'Espace de stockage plein' }]);
        });
    });

    describe('syncGoogleDrive', () => {
        const imported = {
            id: 'doc-1',
            name: 'Rapport.pdf',
            externalId: 'drive-1',
            externalModifiedAt: new Date('2026-10-10T10:00:00.000Z'),
            status: 'INDEXED',
        };

        beforeEach(() => mockDocumentService.getByDataset.mockResolvedValue([imported]));

        it('should leave a document untouched when Drive has no newer version', async () => {
            mockDrive.getFile.mockResolvedValue(driveFile());

            const result = await service.syncGoogleDrive('dataset-1', 'token');

            expect(result).toEqual({ updated: 0, unchanged: 1, removed: [], failed: [] });
            expect(mockDrive.download).not.toHaveBeenCalled();
            expect(mockDocumentService.delete).not.toHaveBeenCalled();
        });

        it('should replace a document modified in Drive since its import', async () => {
            mockDrive.getFile.mockResolvedValue(driveFile({ modifiedTime: '2026-10-12T08:00:00.000Z' }));

            const result = await service.syncGoogleDrive('dataset-1', 'token');

            expect(result).toEqual({ updated: 1, unchanged: 0, removed: [], failed: [] });
            expect(mockDocumentService.delete).toHaveBeenCalledWith('doc-1', 'dataset-1');
            expect(mockDocumentService.ingestFile).toHaveBeenCalledWith(
                'dataset-1',
                downloaded,
                expect.objectContaining({
                    externalModifiedAt: new Date('2026-10-12T08:00:00.000Z'),
                }),
            );
        });

        it('should keep the document when the dataset would refuse its new version', async () => {
            mockDrive.getFile.mockResolvedValue(
                driveFile({ name: 'Notes.pdf', modifiedTime: '2026-10-12T08:00:00.000Z' }),
            );
            mockDocumentService.assertIngestable.mockRejectedValueOnce(
                new ConflictException('Un document nommé « Notes.pdf » existe déjà dans cette base'),
            );

            const result = await service.syncGoogleDrive('dataset-1', 'token');

            expect(mockDocumentService.assertIngestable).toHaveBeenCalledWith('dataset-1', downloaded, imported);
            expect(mockDocumentService.delete).not.toHaveBeenCalled();
            expect(result.failed).toEqual([
                { name: 'Rapport.pdf', reason: 'Un document nommé « Notes.pdf » existe déjà dans cette base' },
            ]);
        });

        it('should remove a document whose Drive file is in the trash, and report it', async () => {
            mockDrive.getFile.mockResolvedValue(driveFile({ trashed: true }));

            const result = await service.syncGoogleDrive('dataset-1', 'token');

            expect(mockDrive.download).not.toHaveBeenCalled();
            expect(mockDocumentService.delete).toHaveBeenCalledWith('doc-1', 'dataset-1');
            expect(result).toEqual({ updated: 0, unchanged: 0, removed: ['Rapport.pdf'], failed: [] });
        });

        it('should keep the document when the new version cannot be downloaded', async () => {
            mockDrive.getFile.mockResolvedValue(driveFile({ modifiedTime: '2026-10-12T08:00:00.000Z' }));
            mockDrive.download.mockRejectedValueOnce(new Error('network'));

            const result = await service.syncGoogleDrive('dataset-1', 'token');

            expect(result.failed).toEqual([{ name: 'Rapport.pdf', reason: 'Erreur inattendue' }]);
            expect(mockDocumentService.delete).not.toHaveBeenCalled();
        });

        it('should not touch a document whose indexing is still running', async () => {
            mockDocumentService.getByDataset.mockResolvedValue([{ ...imported, status: 'PROCESSING' }]);

            const result = await service.syncGoogleDrive('dataset-1', 'token');

            expect(result.failed).toEqual([
                { name: 'Rapport.pdf', reason: expect.stringContaining('Indexation en cours') },
            ]);
            expect(mockDrive.getFile).not.toHaveBeenCalled();
            expect(mockDocumentService.delete).not.toHaveBeenCalled();
        });

        it('should report a document deleted from Drive without removing it from the dataset', async () => {
            mockDrive.getFile.mockRejectedValue(new DriveFileUnavailableError());

            const result = await service.syncGoogleDrive('dataset-1', 'token');

            expect(result.failed).toEqual([
                {
                    name: 'Rapport.pdf',
                    reason: expect.stringContaining('Inaccessible'),
                },
            ]);
            expect(mockDocumentService.delete).not.toHaveBeenCalled();
        });
    });
});
