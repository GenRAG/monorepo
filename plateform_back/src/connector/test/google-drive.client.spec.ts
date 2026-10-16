import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
    DriveAccessExpiredException,
    DriveFile,
    DriveFileUnavailableError,
    GoogleDriveClient,
} from 'src/connector/google-drive.client';

const fetchMock = jest.spyOn(global, 'fetch');
const respond = (status: number, body = '') => fetchMock.mockResolvedValueOnce(new Response(body, { status }));

const googleDoc: DriveFile = {
    id: 'doc-1',
    name: 'Compte rendu',
    mimeType: 'application/vnd.google-apps.document',
    modifiedTime: '2026-10-10T10:00:00.000Z',
};

describe('GoogleDriveClient', () => {
    const client = new GoogleDriveClient();

    beforeEach(() => {
        fetchMock.mockReset();
    });

    it('should export a Google Doc as a PDF named after the document', async () => {
        respond(200, '%PDF-1');

        const file = await client.download('token', googleDoc);

        expect(fetchMock.mock.calls[0][0]).toBe(
            'https://www.googleapis.com/drive/v3/files/doc-1/export?mimeType=application%2Fpdf',
        );
        expect(file).toEqual({
            buffer: Buffer.from('%PDF-1'),
            filename: 'Compte rendu.pdf',
            mimeType: 'application/pdf',
            size: 6,
        });
    });

    it('should download a binary file as is, with the bearer token', async () => {
        respond(200, '%PDF-1');

        await client.download('token', { ...googleDoc, name: 'a.pdf', mimeType: 'application/pdf' });

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe('https://www.googleapis.com/drive/v3/files/doc-1?alt=media&supportsAllDrives=true');
        expect(init.headers).toEqual({ Authorization: 'Bearer token' });
    });

    it('should stop on an expired token and report a missing file', async () => {
        respond(401);
        await expect(client.getFile('token', 'doc-1')).rejects.toThrow(DriveAccessExpiredException);

        respond(404);
        await expect(client.getFile('token', 'doc-1')).rejects.toThrow(DriveFileUnavailableError);
    });
});
