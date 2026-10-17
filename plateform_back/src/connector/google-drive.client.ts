import { BadRequestException, Injectable } from '@nestjs/common';
import { IngestFileInput } from 'src/document/document.service';

const DRIVE_FILES_API = 'https://www.googleapis.com/drive/v3/files';
const FILE_FIELDS = 'id,name,mimeType,modifiedTime,webViewLink,size,trashed';

/** Google-native files have no binary content: they are exported to a format the RAG engine indexes. */
export const GOOGLE_EXPORTS: Record<string, { mimeType: string; extension: string }> = {
    'application/vnd.google-apps.document': {
        mimeType: 'application/pdf',
        extension: '.pdf',
    },
    'application/vnd.google-apps.presentation': {
        mimeType: 'application/pdf',
        extension: '.pdf',
    },
};

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    webViewLink?: string;
    /** Absent for Google-native files. */
    size?: string;
    /** Drive still serves a file in the trash (200): this is the only sign that the user deleted it. */
    trashed?: boolean;
}

/** The file was deleted, or the Google account no longer has access to it. */
export class DriveFileUnavailableError extends Error {}

/** The short-lived access token from the browser expired or was revoked: the whole run stops. */
export class DriveAccessExpiredException extends BadRequestException {
    constructor() {
        super('Accès à Google Drive expiré : reconnectez-vous puis réessayez');
    }
}

@Injectable()
export class GoogleDriveClient {
    async getFile(accessToken: string, fileId: string): Promise<DriveFile> {
        const response = await this.request(
            accessToken,
            `${DRIVE_FILES_API}/${encodeURIComponent(fileId)}?fields=${FILE_FIELDS}&supportsAllDrives=true`,
        );
        return (await response.json()) as DriveFile;
    }

    async download(accessToken: string, file: DriveFile): Promise<IngestFileInput> {
        const id = encodeURIComponent(file.id);
        const exported = GOOGLE_EXPORTS[file.mimeType];
        const url = exported
            ? `${DRIVE_FILES_API}/${id}/export?mimeType=${encodeURIComponent(exported.mimeType)}`
            : `${DRIVE_FILES_API}/${id}?alt=media&supportsAllDrives=true`;

        const buffer = Buffer.from(await (await this.request(accessToken, url)).arrayBuffer());
        return {
            buffer,
            filename: exported ? `${file.name}${exported.extension}` : file.name,
            mimeType: exported?.mimeType ?? file.mimeType,
            size: buffer.length,
        };
    }

    private async request(accessToken: string, url: string): Promise<Response> {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.status === 401) throw new DriveAccessExpiredException();
        if (response.status === 403 || response.status === 404) throw new DriveFileUnavailableError();
        if (!response.ok) throw new Error(`Google Drive API responded ${response.status}`);
        return response;
    }
}
