import { Module } from '@nestjs/common';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { DeploymentRepository } from './deployment.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentModule } from 'src/agent/agent.module';
import { WorkflowModule } from 'src/workflow/workflow.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
    controllers: [DeploymentController],
    providers: [DeploymentService, DeploymentRepository],
    imports: [PrismaModule, AgentModule, WorkflowModule, WorkspaceModule],
})
export class DeploymentModule {}
