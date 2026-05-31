import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentProcessor } from './document.processor';
import { DocumentRepository } from './document.repository';
import { StorageModule } from 'src/storage/storage.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { registerDocumentListeners } from 'src/events/document/document-event.listener';
import { RagEngineModule } from 'src/rag-engine/rag-engine.module';
import { Logger } from 'nestjs-pino';
import { IndexDocumentHandler } from './handlers/index-document.handler';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { AgentModule } from 'src/agent/agent.module';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'documents' }),
        StorageModule,
        PrismaModule,
        RagEngineModule,
        WorkspaceModule,
        AgentModule,
    ],
    controllers: [DocumentController],
    providers: [DocumentService, DocumentProcessor, IndexDocumentHandler, DocumentRepository],
})
export class DocumentModule implements OnModuleInit, OnModuleDestroy {
    private unregisterListeners!: () => void;

    constructor(private readonly logger: Logger) {}

    onModuleInit() {
        this.unregisterListeners = registerDocumentListeners(this.logger);
    }

    onModuleDestroy() {
        this.unregisterListeners();
    }
}
