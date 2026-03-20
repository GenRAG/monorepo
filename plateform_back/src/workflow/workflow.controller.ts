import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { CreateWorkflowRequest } from 'src/workflow/dto/create-workflow.request';
import { UpdateWorkflowRequest } from 'src/workflow/dto/update-workflow.request';
import { WorkflowService } from 'src/workflow/workflow.service';

@Controller('workspaces/:workspaceId/agents/:agentId/workflow')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard)
export class WorkflowController {
    constructor(private readonly workflowService: WorkflowService) {}

    @Get()
    findActive(@Param('agentId') agentId: string) {
        return this.workflowService.findActive(agentId);
    }

    @Get('history')
    findAll(@Param('agentId') agentId: string) {
        return this.workflowService.findAll(agentId);
    }

    @Patch()
    update(
        @Param('agentId') agentId: string,
        @Body() updateWorkflowRequest: UpdateWorkflowRequest,
    ) {
        return this.workflowService.update(agentId, updateWorkflowRequest);
    }

    @Post()
    deploy(
        @Param('agentId') agentId: string,
        @Body() createWorkflowRequest: CreateWorkflowRequest,
    ) {
        return this.workflowService.create(agentId, createWorkflowRequest);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.workflowService.findOne(id);
    }
}
