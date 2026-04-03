export interface IStorageStrategy {
    put(key: string, buffer: Buffer, mimeType: string): Promise<void>;
    get(key: string): Promise<Buffer>;
    getSignedUrl(key: string, expiresIn: number): Promise<string>;
}
