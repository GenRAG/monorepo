import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
