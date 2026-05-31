import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { AgentMemberController } from './agent-member.controller';
import { AgentMemberService } from './agent-member.service';
import { AgentMemberRepository } from './agent-member.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AgentRepository } from 'src/agent/agent.repository';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
    controllers: [AgentController, AgentMemberController],
    providers: [AgentService, AgentRepository, AgentMemberService, AgentMemberRepository, AgentBelongsToWorkspaceGuard],
    imports: [PrismaModule, WorkspaceModule],
    exports: [AgentService, AgentRepository, AgentBelongsToWorkspaceGuard],
})
export class AgentModule {}
