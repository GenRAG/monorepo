import { Body, Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';
import { DatasetBelongsToWorkspaceGuard } from 'src/dataset/guard/dataset-workspace.guard';
import { ConnectorService } from './connector.service';
import { GoogleDriveImportRequest, GoogleDriveSyncRequest } from './dto/google-drive.request';
import { ConnectorImportResult, ConnectorSyncResult } from './connector.types';

@Controller('workspaces/:workspaceId/datasets/:datasetId/connectors/google-drive')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard, DatasetBelongsToWorkspaceGuard, ThrottlerGuard)
// Each call downloads up to 20 files from Drive.
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class ConnectorController {
    constructor(private readonly connectorService: ConnectorService) {}

    @Post('import')
    @ApiOperation({
        summary: 'Import files picked in Google Drive into the dataset',
    })
    import(
        @Param('datasetId') datasetId: string,
        @Body() dto: GoogleDriveImportRequest,
    ): Promise<ConnectorImportResult> {
        return this.connectorService.importFromGoogleDrive(datasetId, dto.accessToken, dto.fileIds);
    }

    @Post('sync')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Re-import the Google Drive documents of the dataset modified since their import',
    })
    sync(@Param('datasetId') datasetId: string, @Body() dto: GoogleDriveSyncRequest): Promise<ConnectorSyncResult> {
        return this.connectorService.syncGoogleDrive(datasetId, dto.accessToken);
    }
}
