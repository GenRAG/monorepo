import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentModule } from 'src/agent/agent.module';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingRepository } from './onboarding.repository';

@Module({
    controllers: [OnboardingController],
    providers: [OnboardingService, OnboardingRepository],
    imports: [PrismaModule, AgentModule, WorkflowModule],
})
export class OnboardingModule {}
