import {
    Controller,
    Post,
    Get,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { DocumentService } from './document.service';

@Controller('workspaces/:workspaceId/agents/:agentId/documents')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    upload(@Param('agentId') agentId: string, @UploadedFile() file: File) {
        return this.documentService.uploadDocument(file, agentId);
    }

    @Get()
    getAll(@Param('agentId') agentId: string) {
        return this.documentService.getDocumentsByAgent(agentId);
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.documentService.getDocument(id);
    }

    @Get(':id/url')
    getUrl(@Param('id') id: string) {
        return this.documentService.getDocumentUrl(id);
    }
}
