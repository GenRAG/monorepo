import { Module } from '@nestjs/common';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { DeploymentRepository } from './deployment.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentModule } from 'src/agent/agent.module';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { AgentRuntimeModule } from 'src/agent-runtime/agent-runtime.module';

@Module({
    controllers: [DeploymentController],
    providers: [DeploymentService, DeploymentRepository],
    imports: [PrismaModule, AgentModule, WorkflowModule, WorkspaceModule, AgentRuntimeModule],
})
export class DeploymentModule {}
