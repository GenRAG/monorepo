import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AgentRuntimeService } from './agent-runtime.service';
import { AgentRuntimeController } from './agent-runtime.controller';
import { AgentQueryLogRepository } from './agent-query-log.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { RagPipelineBuilder } from 'src/agent-runtime/agent-runtime.builder';
import { RagEngineModule } from 'src/rag-engine/rag-engine.module';
import { AgentModule } from 'src/agent/agent.module';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { ConfigModule } from '@nestjs/config';
import { CreditModule } from 'src/credit/credit.module';
import { registerAgentListeners } from 'src/events/agent/agent-event.listener';
import { Logger } from 'nestjs-pino';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
    controllers: [AgentRuntimeController],
    providers: [AgentRuntimeService, AgentRuntimeOrchestrator, RagPipelineBuilder, AgentQueryLogRepository],
    exports: [AgentRuntimeOrchestrator, AgentRuntimeService],
    imports: [PrismaModule, CreditModule, AgentModule, WorkflowModule, RagEngineModule, ConfigModule, WorkspaceModule],
})
export class AgentRuntimeModule implements OnModuleInit, OnModuleDestroy {
    private unregisterListeners!: () => void;

    constructor(private readonly logger: Logger) {}

    onModuleInit() {
        this.unregisterListeners = registerAgentListeners(this.logger);
    }

    onModuleDestroy() {
        this.unregisterListeners();
    }
}
