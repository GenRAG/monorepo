import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { RolesInWorkspace } from 'src/workspace/roles/roles-workspace.decorator';
import { UserRole } from 'generated/prisma';
import { AgentMemberService } from './agent-member.service';
import { AddAgentMemberRequest } from './dto/add-agent-member.request';

@Controller('workspaces/:workspaceId/agents/:agentId/members')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard, AgentBelongsToWorkspaceGuard)
export class AgentMemberController {
    constructor(private readonly agentMemberService: AgentMemberService) {}

    @Get()
    getMembers(@Param('agentId') agentId: string) {
        return this.agentMemberService.getMembers(agentId);
    }

    @Post()
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    addMember(@Param('agentId') agentId: string, @Body() dto: AddAgentMemberRequest) {
        return this.agentMemberService.addMember(agentId, dto.email);
    }

    @Delete(':memberId')
    @HttpCode(204)
    @RolesInWorkspace(UserRole.ADMIN, UserRole.EDITOR)
    removeMember(@Param('agentId') agentId: string, @Param('memberId') memberId: string) {
        return this.agentMemberService.removeMember(agentId, memberId);
    }
}
