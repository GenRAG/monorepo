import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'generated/prisma';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import type { IncomingMessage } from 'http';

enum JobStatus {
    COMPLETED = 'completed',
    FAILED = 'failed',
    PENDING = 'pending',
}

@Injectable()
export class RagEngineService {
    private readonly logger = new Logger(RagEngineService.name);
    private readonly ragEngineUrl: string;
    private readonly apiKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.ragEngineUrl = this.configService.getOrThrow<string>('RAGENGINE_URL');
        this.apiKey = this.configService.getOrThrow<string>('RAGENGINE_API_KEY');
    }

    async sendQuery({
        pipeline,
        query,
        orgId,
        mock = false,
    }: {
        pipeline: Prisma.JsonValue;
        query: string;
        orgId: string;
        mock?: boolean;
    }): Promise<string> {
        if (mock) {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.ragEngineUrl}/rag/stream/mock`,
                    {},
                    { responseType: 'stream', timeout: 30_000 },
                ),
            );
            return new Promise<string>((resolve, reject) => {
                const stream = response.data as IncomingMessage;
                const chunks: Buffer[] = [];
                stream.on('data', (chunk: Buffer) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
                stream.on('error', (err: Error) => reject(err));
            });
        }

        const body = JSON.stringify({
            pipeline: { blocks: pipeline },
            query,
            org_id: orgId,
        });

        this.logger.debug(`Sending query to RAG engine: ${this.ragEngineUrl}/rag/stream`);
        console.log(body);
        const response = await firstValueFrom(
            this.httpService.post(`${this.ragEngineUrl}/rag/stream`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                    'Accept-Encoding': 'identity',
                },
                responseType: 'stream',
                timeout: 120_000,
            }),
        );

        return new Promise<string>((resolve, reject) => {
            const stream = response.data as IncomingMessage;
            const chunks: Buffer[] = [];

            stream.on('data', (chunk: Buffer) => chunks.push(chunk));

            stream.on('end', () => {
                const text = Buffer.concat(chunks).toString('utf-8');
                this.logger.debug(`RAG stream completed, length: ${text.length}`);
                resolve(text);
            });

            stream.on('error', (err: Error) => {
                const partial = Buffer.concat(chunks).toString('utf-8');
                if (partial.length > 0) {
                    this.logger.warn(`RAG stream aborted after ${partial.length} chars: ${err.message}`);
                    resolve(partial);
                } else {
                    this.logger.error(`RAG stream failed: ${err.message}`);
                    reject(new Error(`RAG engine stream failed: ${err.message}`));
                }
            });
        });
    }

    async getQueryStream({
        pipeline,
        query,
        orgId,
        mock = false,
    }: {
        pipeline: Prisma.JsonValue;
        query: string;
        orgId: string;
        mock?: boolean;
    }): Promise<IncomingMessage> {
        if (mock) {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.ragEngineUrl}/rag/stream/mock`,
                    {},
                    { responseType: 'stream', timeout: 30_000 },
                ),
            );
            return response.data as IncomingMessage;
        }

        const body = JSON.stringify({
            pipeline: { blocks: pipeline },
            query,
            org_id: orgId,
        });
        const response = await firstValueFrom(
            this.httpService.post(`${this.ragEngineUrl}/rag/stream`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                    'Accept-Encoding': 'identity',
                },
                responseType: 'stream',
                timeout: 120_000,
            }),
        );

        return response.data as IncomingMessage;
    }

    async indexDocument(name: string, agentId: string, buffer: Buffer, mimeType: string): Promise<void> {
        const form = new FormData();

        form.append('file', buffer, {
            filename: name,
            contentType: mimeType,
        });
        form.append('org_id', agentId);

        const response = await firstValueFrom(
            this.httpService.post(`${this.ragEngineUrl}/ingest`, form, {
                headers: {
                    ...form.getHeaders(),
                    'X-API-Key': this.apiKey,
                },
                timeout: 30_000,
            }),
        );

        const { job_id } = response.data as { job_id: string };
        await this.waitForJob(job_id);
    }

    private async waitForJob(jobId: string, timeoutMs = 300_000): Promise<void> {
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
            const response = await firstValueFrom(
                this.httpService.get(`${this.ragEngineUrl}/job/${jobId}/status`, { timeout: 10_000 }),
            );

            const { status, error } = response.data as {
                status: JobStatus;
                error?: string;
            };

            if (status === JobStatus.COMPLETED) return;

            if (status === JobStatus.FAILED) {
                throw new Error(`RAG engine job ${jobId} failed: ${error ?? 'unknown error'}`);
            }

            this.logger.debug(`Job ${jobId} status: ${status}`);
            await new Promise((resolve) => setTimeout(resolve, 2_000));
        }

        throw new Error(`RAG engine job ${jobId} timed out after ${timeoutMs}ms`);
    }
}
