import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { DocumentSource, DocumentStatus } from 'generated/prisma';
import { DocumentOrigin, DocumentService, IngestFileInput } from 'src/document/document.service';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from 'src/document/document.constants';
import {
    DriveAccessExpiredException,
    DriveFile,
    DriveFileUnavailableError,
    GOOGLE_EXPORTS,
    GoogleDriveClient,
} from './google-drive.client';
import { ConnectorImportResult, ConnectorSyncResult, FailedFile } from './connector.types';

const toOrigin = (file: DriveFile): DocumentOrigin => ({
    source: DocumentSource.GOOGLE_DRIVE,
    externalId: file.id,
    externalUrl: file.webViewLink,
    externalModifiedAt: new Date(file.modifiedTime),
});

@Injectable()
export class ConnectorService {
    private readonly logger = new Logger(ConnectorService.name);

    constructor(
        private readonly documentService: DocumentService,
        private readonly googleDrive: GoogleDriveClient,
    ) {}

    async importFromGoogleDrive(
        datasetId: string,
        accessToken: string,
        fileIds: string[],
    ): Promise<ConnectorImportResult> {
        const alreadyImported = new Set(
            (await this.documentService.getByDataset(datasetId, [DocumentSource.GOOGLE_DRIVE])).map(
                (doc) => doc.externalId,
            ),
        );
        const result: ConnectorImportResult = { imported: 0, failed: [] };

        // shortcut: files are fetched one by one inside the request; move to a BullMQ job if imports grow past ~20 files.
        for (const fileId of fileIds) {
            let name = fileId;
            try {
                const file = await this.googleDrive.getFile(accessToken, fileId);
                name = file.name;
                if (alreadyImported.has(file.id)) {
                    result.failed.push({
                        name,
                        reason: 'Déjà importé dans cette base',
                    });
                    continue;
                }
                await this.documentService.ingestFile(
                    datasetId,
                    await this.download(accessToken, file),
                    toOrigin(file),
                );
                result.imported++;
            } catch (error) {
                result.failed.push(this.toFailure(name, error));
            }
        }
        return result;
    }

    /** Re-imports every Google Drive document of the dataset modified in Drive since its import. */
    async syncGoogleDrive(datasetId: string, accessToken: string): Promise<ConnectorSyncResult> {
        const documents = await this.documentService.getByDataset(datasetId, [DocumentSource.GOOGLE_DRIVE]);
        const result: ConnectorSyncResult = {
            updated: 0,
            unchanged: 0,
            failed: [],
        };

        // shortcut: one Drive call per document inside the request; move to a BullMQ job past ~100 Drive documents.
        for (const doc of documents) {
            if (!doc.externalId) continue;
            // Deleting it now would let the running indexing job push the old content to the engine after the delete.
            if (doc.status === DocumentStatus.UPLOADED || doc.status === DocumentStatus.PROCESSING) {
                result.failed.push({ name: doc.name, reason: 'Indexation en cours, réessayez dans quelques minutes' });
                continue;
            }
            try {
                const file = await this.googleDrive.getFile(accessToken, doc.externalId);
                if (doc.externalModifiedAt && new Date(file.modifiedTime) <= doc.externalModifiedAt) {
                    result.unchanged++;
                    continue;
                }

                // Downloaded before the old version is deleted, so a Drive failure leaves the document untouched.
                const download = await this.download(accessToken, file);
                // shortcut: delete then re-ingest; if the re-ingest fails the document leaves the dataset (it is still in
                // Drive, re-importable). Replace in place in DocumentService if that happens in practice.
                await this.documentService.delete(doc.id, datasetId);
                await this.documentService.ingestFile(datasetId, download, toOrigin(file));
                result.updated++;
            } catch (error) {
                result.failed.push(this.toFailure(doc.name, error));
            }
        }
        return result;
    }

    private download(accessToken: string, file: DriveFile): Promise<IngestFileInput> {
        // Checked from the metadata so an unsupported or oversized file is never downloaded.
        if (!GOOGLE_EXPORTS[file.mimeType] && !ALLOWED_MIME_TYPES.has(file.mimeType)) {
            throw new BadRequestException('Type de fichier non supporté');
        }
        if (Number(file.size ?? 0) > MAX_FILE_SIZE) {
            throw new BadRequestException(`Le fichier dépasse ${MAX_FILE_SIZE / 1024 / 1024} Mo`);
        }
        return this.googleDrive.download(accessToken, file);
    }

    private toFailure(name: string, error: unknown): FailedFile {
        // An expired token fails every remaining file the same way: stop the whole run instead.
        if (error instanceof DriveAccessExpiredException) throw error;
        if (error instanceof DriveFileUnavailableError) {
            return {
                name,
                reason: 'Inaccessible dans Google Drive : supprimé, plus partagé avec ce compte, ou quota Google atteint',
            };
        }
        if (error instanceof HttpException) {
            return { name, reason: error.message };
        }
        this.logger.error(error);
        return { name, reason: 'Erreur inattendue' };
    }
}
