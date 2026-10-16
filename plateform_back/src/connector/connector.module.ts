import { Module } from '@nestjs/common';
import { DocumentModule } from 'src/document/document.module';
import { DatasetModule } from 'src/dataset/dataset.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { ConnectorController } from './connector.controller';
import { ConnectorService } from './connector.service';
import { GoogleDriveClient } from './google-drive.client';

@Module({
    imports: [DocumentModule, DatasetModule, WorkspaceModule],
    controllers: [ConnectorController],
    providers: [ConnectorService, GoogleDriveClient],
})
export class ConnectorModule {}
