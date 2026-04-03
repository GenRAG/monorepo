// src/storage/s3.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageStrategy } from './storage.strategy';

@Injectable()
export class S3StorageStrategy implements IStorageStrategy {
    private readonly client: S3Client;
    private readonly bucket: string;

    constructor(private readonly config: ConfigService) {
        this.client = new S3Client({
            region: config.getOrThrow('AWS_REGION'),
            credentials: {
                accessKeyId: config.getOrThrow('AWS_ACCESS_KEY_ID'),
                secretAccessKey: config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
            },
        });
        this.bucket = config.getOrThrow('S3_BUCKET');
    }

    async put(key: string, buffer: Buffer, mimeType: string): Promise<void> {
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
            }),
        );
    }

    async get(key: string): Promise<Buffer> {
        const response = await this.client.send(
            new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }),
        );

        const chunks: Buffer[] = [];
        for await (const chunk of response.Body as any) {
            chunks.push(Buffer.from(chunk));
        }

        return Buffer.concat(chunks);
    }

    async getSignedUrl(key: string, expiresIn: number): Promise<string> {
        return getSignedUrl(
            this.client,
            new GetObjectCommand({ Bucket: this.bucket, Key: key }),
            { expiresIn },
        );
    }
}
