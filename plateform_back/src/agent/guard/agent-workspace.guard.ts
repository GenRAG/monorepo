import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { AgentRepository } from 'src/agent/agent.repository';

@Injectable()
export class AgentBelongsToWorkspaceGuard implements CanActivate {
    constructor(private readonly agentRepository: AgentRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { workspaceId, agentId, id } = request.params;
        const effectiveAgentId = agentId ?? id;

        if (!effectiveAgentId || !workspaceId) return true;

        const agent = await this.agentRepository.findOne(effectiveAgentId, workspaceId);

        if (!agent) throw new NotFoundException('Agent pas trouvé');

        return true;
    }
}
