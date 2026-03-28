import { Module, OnModuleInit } from '@nestjs/common';
import { AgentRuntimeService } from './agent-runtime.service';
import { AgentRuntimeController } from './agent-runtime.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { ContextBuilder } from 'src/agent-runtime/agent-runtime.builder';
import { RagEngineService } from 'src/rag-engine/rag-execution.service';
import { UsageTrackerModule } from 'src/usage-tracker/usage-tracker.module';
import { AgentModule } from 'src/agent/agent.module';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CreditTransactionModule } from 'src/transaction/credit-transaction.module';
import { UsageTrackerService } from 'src/usage-tracker/usage-tracker.service';
import { registerAgentListeners } from 'src/events/agent-event.listener';

@Module({
    controllers: [AgentRuntimeController],
    providers: [
        AgentRuntimeService,
        AgentRuntimeOrchestrator,
        ContextBuilder,
        RagEngineService,
    ],
    imports: [
        PrismaModule,
        UsageTrackerModule,
        CreditTransactionModule,
        AgentModule,
        WorkflowModule,
        HttpModule,
        ConfigModule,
    ],
})
export class AgentRuntimeModule implements OnModuleInit {
    constructor(private readonly usageTracker: UsageTrackerService) {}

    onModuleInit() {
        registerAgentListeners(this.usageTracker);
    }
}
