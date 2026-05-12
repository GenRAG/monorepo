import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AxiosError } from 'axios';
import { IndexDocumentCommandProps } from './commands/index-document.command';
import { IndexDocumentHandler } from './handlers/index-document.handler';
import { mapIndexDocumentJobToCommand } from './mappers/index-document-job.mapper';

@Injectable()
@Processor('documents', {
    concurrency: 2,
    lockDuration: 120_000,
    stalledInterval: 120_000,
    drainDelay: 2_000,
})
export class DocumentProcessor extends WorkerHost {
    private readonly logger = new Logger(DocumentProcessor.name);

    constructor(private readonly indexDocumentHandler: IndexDocumentHandler) {
        super();
    }

    async process(job: Job<IndexDocumentCommandProps>): Promise<void> {
        const command = mapIndexDocumentJobToCommand(job.data);

        try {
            await this.indexDocumentHandler.execute(command);
        } catch (error) {
            const attemptNumber = job.attemptsMade + 1;
            const maxAttempts = job.opts.attempts ?? 1;

            this.logger.error(
                `Job ${job.id} failed for document ${command.documentId} (${attemptNumber}/${maxAttempts})`,
                error instanceof Error ? error.stack : undefined,
            );

            if (attemptNumber >= maxAttempts) {
                await this.indexDocumentHandler.failed(command, this.extractErrorMessage(error));
            } else {
                await this.indexDocumentHandler.retrying(command, attemptNumber);
            }

            throw error;
        }
    }

    private extractErrorMessage(error: unknown): string {
        if (error instanceof AxiosError) {
            return error.response?.data?.detail ?? error.response?.data?.message ?? error.message ?? 'Erreur inconnue';
        }
        if (error instanceof Error) {
            return error.message;
        }
        return 'Erreur inconnue';
    }
}
