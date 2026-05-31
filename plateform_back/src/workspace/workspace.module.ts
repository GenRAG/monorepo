import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';
import { WorkspaceStatsService } from 'src/workspace/workspace-stats.service';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';

@Module({
    imports: [PrismaModule],
    providers: [WorkspaceService, WorkspaceRepository, WorkspaceStatsService, WorkspaceRolesGuard],
    controllers: [WorkspaceController],
    exports: [WorkspaceService, WorkspaceRepository, WorkspaceRolesGuard],
})
export class WorkspaceModule {}
