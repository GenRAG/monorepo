import {
    Controller,
    Post,
    Get,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { DocumentService } from './document.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { File } from 'multer';

@Controller('workspaces/:workspaceId/agents/:agentId/documents')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a document' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    upload(@Param('agentId') agentId: string, @UploadedFile() file: File) {
        return this.documentService.upload(file, agentId);
    }

    @Get('stats')
    getStats(@Param('agentId') agentId: string) {
        return this.documentService.getStats(agentId);
    }

    @Get()
    getAll(
        @Param('agentId') agentId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        if (page !== undefined || limit !== undefined) {
            const p = Math.max(1, parseInt(page ?? '1', 10) || 1);
            const l = Math.min(
                100,
                Math.max(1, parseInt(limit ?? '10', 10) || 10),
            );
            return this.documentService.getByAgentPaginated(agentId, p, l);
        }
        return this.documentService.getByAgent(agentId);
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.documentService.get(id);
    }

    @Get(':id/url')
    getUrl(@Param('id') id: string) {
        return this.documentService.getUrl(id);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.documentService.delete(id);
    }
}
