export interface IStorageStrategy {
    put(key: string, buffer: Buffer, mimeType: string): Promise<void>;
    get(key: string): Promise<Buffer>;
    delete(key: string): Promise<void>;
    getSignedUrl(key: string, expiresIn: number): Promise<string>;
}
