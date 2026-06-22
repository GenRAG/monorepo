import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { RolesInWorkspace } from 'src/workspace/roles/roles-workspace.decorator';
import { UserRole } from 'generated/prisma';
import { DocumentService } from './document.service';
import { DocumentPaginationQuery } from './dto/document-pagination.query';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'text/plain', 'text/markdown']);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Controller('workspaces/:workspaceId/agents/:agentId/documents')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard, AgentBelongsToWorkspaceGuard)
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Post()
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
    @ApiOperation({ summary: 'Upload a document' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    upload(@Param('agentId') agentId: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Aucun fichier fourni');
        if (!file.buffer || file.buffer.length === 0) throw new BadRequestException('Le fichier est vide');
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) throw new BadRequestException('Type de fichier non supporté');
        return this.documentService.upload(file, agentId);
    }

    @Get('stats')
    getStats(@Param('agentId') agentId: string) {
        return this.documentService.getStats(agentId);
    }

    @Get()
    getAll(@Param('agentId') agentId: string, @Query() query: DocumentPaginationQuery) {
        if (query.page !== undefined || query.limit !== undefined) {
            return this.documentService.getByAgentPaginated(agentId, query.page ?? 1, query.limit ?? 10);
        }
        return this.documentService.getByAgent(agentId);
    }

    @Get(':id')
    getOne(@Param('id') id: string, @Param('agentId') agentId: string) {
        return this.documentService.get(id, agentId);
    }

    @Get(':id/url')
    getUrl(@Param('id') id: string, @Param('agentId') agentId: string) {
        return this.documentService.getUrl(id, agentId);
    }

    @Get(':id/content')
    getContent(@Param('id') id: string, @Param('agentId') agentId: string) {
        return this.documentService.getContent(id, agentId);
    }

    @Post(':id/retry')
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    @ApiOperation({ summary: 'Retry indexing a failed document' })
    retry(@Param('id') id: string, @Param('agentId') agentId: string) {
        return this.documentService.retry(id, agentId);
    }

    @Delete(':id')
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    @HttpCode(204)
    async delete(@Param('id') id: string, @Param('agentId') agentId: string): Promise<void> {
        await this.documentService.delete(id, agentId);
    }
}
