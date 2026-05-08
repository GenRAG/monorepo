import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'generated/prisma';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class RagEngineService {
    private readonly ragEngineUrl: string;
    private readonly apiKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.ragEngineUrl =
            this.configService.getOrThrow<string>('RAGENGINE_URL');
        this.apiKey =
            this.configService.getOrThrow<string>('RAGENGINE_API_KEY');
    }

    async sendQuery({
        pipeline,
        query,
    }: {
        pipeline: Prisma.JsonValue;
        query: string;
    }) {
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.ragEngineUrl}/rag/stream`,
                { pipeline, query },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': this.apiKey,
                    },
                },
            ),
        );

        return response.data;
    }

    async indexDocument(
        documentId: string,
        buffer: Buffer,
        mimeType: string,
    ): Promise<void> {
        const form = new FormData();

        form.append('file', buffer, {
            filename: documentId,
            contentType: mimeType,
        });
        form.append('document_id', documentId);

        await firstValueFrom(
            this.httpService.post(`${this.ragEngineUrl}/rag/index`, form, {
                headers: form.getHeaders(),
                timeout: 60_000,
            }),
        );
    }
}
