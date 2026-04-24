// src/document/document.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentProcessor } from './document.processor';
import { DocumentRepository } from './document.repository';
import { StorageModule } from 'src/storage/storage.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { registerDocumentListeners } from 'src/events/document/document-event.listener';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { Logger } from 'nestjs-pino';
import { IndexDocumentHandler } from './handlers/index-document.handler';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'documents' }),
        StorageModule,
        PrismaModule,
        HttpModule,
    ],
    controllers: [DocumentController],
    providers: [
        DocumentService,
        DocumentProcessor,
        IndexDocumentHandler,
        DocumentRepository,
        RagEngineService,
    ],
})
export class DocumentModule implements OnModuleInit {
    constructor(private readonly logger: Logger) {}

    onModuleInit() {
        registerDocumentListeners(this.logger);
    }
}
