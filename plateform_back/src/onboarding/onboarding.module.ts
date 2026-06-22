import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentModule } from 'src/agent/agent.module';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { AgentRuntimeModule } from 'src/agent-runtime/agent-runtime.module';
import { CreditModule } from 'src/credit/credit.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingRepository } from './onboarding.repository';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
    controllers: [OnboardingController],
    providers: [OnboardingService, OnboardingRepository],
    imports: [PrismaModule, AgentModule, WorkflowModule, AgentRuntimeModule, CreditModule, WorkspaceModule],
})
export class OnboardingModule {}
