import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from 'src/workspace/guards/workspace-member.guard';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { AgentMemberService } from './agent-member.service';
import { AddAgentMemberRequest } from './dto/add-agent-member.request';

@Controller('workspaces/:workspaceId/agents/:agentId/members')
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard, AgentBelongsToWorkspaceGuard)
export class AgentMemberController {
    constructor(private readonly agentMemberService: AgentMemberService) {}

    @Get()
    getMembers(@Param('agentId') agentId: string) {
        return this.agentMemberService.getMembers(agentId);
    }

    @Post()
    addMember(@Param('agentId') agentId: string, @Body() dto: AddAgentMemberRequest) {
        return this.agentMemberService.addMember(agentId, dto.email);
    }

    @Delete(':memberId')
    @HttpCode(204)
    removeMember(@Param('agentId') agentId: string, @Param('memberId') memberId: string) {
        return this.agentMemberService.removeMember(agentId, memberId);
    }
}
