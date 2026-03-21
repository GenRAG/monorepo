import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';

@Module({
    imports: [PrismaModule],
    providers: [WorkspaceService, WorkspaceRepository],
    controllers: [WorkspaceController],
})
export class WorkspaceModule {}
