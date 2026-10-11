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
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';
import { DatasetBelongsToWorkspaceGuard } from 'src/dataset/guard/dataset-workspace.guard';
import { DocumentService } from './document.service';
import { matchesDeclaredType } from 'src/lib/file-signature.util';
import { DocumentPaginationQuery } from './dto/document-pagination.query';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';

const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'text/html',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const toArray = <T>(value?: T | T[]): T[] | undefined =>
    value === undefined ? undefined : Array.isArray(value) ? value : [value];

@Controller('workspaces/:workspaceId/datasets/:datasetId/documents')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard, DatasetBelongsToWorkspaceGuard)
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Post()
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
    upload(@Param('datasetId') datasetId: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Aucun fichier fourni');
        if (!file.buffer || file.buffer.length === 0) throw new BadRequestException('Le fichier est vide');
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) throw new BadRequestException('Type de fichier non supporté');
        if (!matchesDeclaredType(file.buffer, file.mimetype)) {
            throw new BadRequestException('Le contenu du fichier ne correspond pas à son type');
        }
        return this.documentService.upload(file, datasetId);
    }

    @Get('stats')
    getStats(@Param('datasetId') datasetId: string) {
        return this.documentService.getStats(datasetId);
    }

    @Get()
    getAll(@Param('datasetId') datasetId: string, @Query() query: DocumentPaginationQuery) {
        if (query.page !== undefined || query.limit !== undefined) {
            return this.documentService.getByDatasetPaginated(
                datasetId,
                query.page ?? 1,
                query.limit ?? 10,
                toArray(query.source),
            );
        }
        return this.documentService.getByDataset(datasetId, toArray(query.source));
    }

    @Get(':id')
    getOne(@Param('id') id: string, @Param('datasetId') datasetId: string) {
        return this.documentService.get(id, datasetId);
    }

    @Get(':id/url')
    getUrl(@Param('id') id: string, @Param('datasetId') datasetId: string) {
        return this.documentService.getUrl(id, datasetId);
    }

    @Get(':id/content')
    getContent(@Param('id') id: string, @Param('datasetId') datasetId: string) {
        return this.documentService.getContent(id, datasetId);
    }

    @Post(':id/retry')
    @ApiOperation({ summary: 'Retry indexing a failed document' })
    retry(@Param('id') id: string, @Param('datasetId') datasetId: string) {
        return this.documentService.retry(id, datasetId);
    }

    @Delete(':id')
    @HttpCode(204)
    async delete(@Param('id') id: string, @Param('datasetId') datasetId: string): Promise<void> {
        await this.documentService.delete(id, datasetId);
    }
}
