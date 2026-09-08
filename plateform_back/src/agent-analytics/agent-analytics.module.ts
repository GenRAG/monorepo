import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentModule } from 'src/agent/agent.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { AgentAnalyticsController } from './agent-analytics.controller';
import { AgentAnalyticsService } from './agent-analytics.service';
import { AgentAnalyticsRepository } from './agent-analytics.repository';

@Module({
    controllers: [AgentAnalyticsController],
    providers: [AgentAnalyticsService, AgentAnalyticsRepository],
    imports: [PrismaModule, AgentModule, WorkspaceModule],
})
export class AgentAnalyticsModule {}
