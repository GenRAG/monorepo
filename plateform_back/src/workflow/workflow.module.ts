import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkflowController } from 'src/workflow/workflow.controller';

@Module({
    controllers: [WorkflowController],
    providers: [WorkflowService],
    imports: [PrismaModule],
})
export class WorkflowModule {}
