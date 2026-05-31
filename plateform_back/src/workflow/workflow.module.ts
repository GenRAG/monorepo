import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkflowController } from 'src/workflow/workflow.controller';
import { WorkflowRepository } from 'src/workflow/workflow.repository';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { AgentModule } from 'src/agent/agent.module';

@Module({
    controllers: [WorkflowController],
    providers: [WorkflowService, WorkflowRepository],
    imports: [PrismaModule, WorkspaceModule, AgentModule],
    exports: [WorkflowService],
})
export class WorkflowModule {}
