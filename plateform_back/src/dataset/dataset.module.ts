import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentModule } from 'src/agent/agent.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { StorageModule } from 'src/storage/storage.module';
import { RagEngineModule } from 'src/rag-engine/rag-engine.module';
import { DatasetController } from './dataset.controller';
import { DatasetService, DATASET_CLEANUP_QUEUE } from './dataset.service';
import { DatasetRepository } from './dataset.repository';
import { DatasetCleanupProcessor } from './dataset-cleanup.processor';
import { DatasetBelongsToWorkspaceGuard } from './guard/dataset-workspace.guard';

@Module({
    imports: [
        BullModule.registerQueue({ name: DATASET_CLEANUP_QUEUE }),
        PrismaModule,
        AgentModule,
        WorkspaceModule,
        StorageModule,
        RagEngineModule,
    ],
    controllers: [DatasetController],
    providers: [DatasetService, DatasetRepository, DatasetCleanupProcessor, DatasetBelongsToWorkspaceGuard],
    exports: [DatasetService, DatasetRepository, DatasetBelongsToWorkspaceGuard],
})
export class DatasetModule {}
