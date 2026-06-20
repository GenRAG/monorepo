import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RagEngineService } from './rag-execution.service';
import { RagEngineController } from './rag-engine.controller';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [RagEngineController],
    providers: [RagEngineService],
    exports: [RagEngineService],
})
export class RagEngineModule {}
