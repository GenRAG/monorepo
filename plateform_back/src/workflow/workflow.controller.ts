import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';
import { CreateWorkflowRequest } from 'src/workflow/dto/create-workflow.request';
import { UpdateWorkflowRequest } from 'src/workflow/dto/update-workflow.request';
import { WorkflowService } from 'src/workflow/workflow.service';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';

@Controller('workspaces/:workspaceId/agents/:agentId/workflow')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard, AgentBelongsToWorkspaceGuard)
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

    @Get('version/:v')
    findByVersion(@Param('agentId') agentId: string, @Param('v', ParseIntPipe) v: number) {
        return this.workflowService.findByVersion(agentId, v);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Param('agentId') agentId: string) {
        return this.workflowService.findOne(id, agentId);
    }

    @Patch()
    update(@Param('agentId') agentId: string, @Body() updateWorkflowRequest: UpdateWorkflowRequest) {
        return this.workflowService.update(agentId, updateWorkflowRequest);
    }

    @Post()
    deploy(@Param('agentId') agentId: string, @Body() createWorkflowRequest: CreateWorkflowRequest) {
        return this.workflowService.create(agentId, createWorkflowRequest);
    }
}
