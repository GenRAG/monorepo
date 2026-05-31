import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RagEngineService } from './rag-execution.service';

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [RagEngineService],
    exports: [RagEngineService],
})
export class RagEngineModule {}
