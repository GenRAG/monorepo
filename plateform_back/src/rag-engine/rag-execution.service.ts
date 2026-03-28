import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonValue } from 'generated/prisma/runtime/library';
import { firstValueFrom } from 'rxjs';

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
        pipeline: JsonValue;
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
}
