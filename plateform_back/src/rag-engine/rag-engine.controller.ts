import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { RagEngineService } from './rag-execution.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('rag')
@UseGuards(JwtAuthGuard)
export class RagEngineController {
    constructor(private readonly ragEngineService: RagEngineService) {}

    @Get('models/generation')
    async getModels() {
        return this.ragEngineService.getModelsGeneration();
    }

    @Get('models/rerank')
    async getRerankingModels() {
        return this.ragEngineService.getRerankingModels();
    }

    @Get('models/:modelId/info')
    async getModelInfo(@Param('modelId') modelId: string) {
        return this.ragEngineService.getModelInfo(modelId);
    }
}
