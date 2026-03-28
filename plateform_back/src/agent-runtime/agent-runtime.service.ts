import { Injectable } from '@nestjs/common';
import { AgentRuntimeOrchestrator } from 'src/agent-runtime/agent-runtime.orchestrator';
import { ExecuteAgentRuntimeRequest } from 'src/agent-runtime/dto/create-agent-runtime.request';

@Injectable()
export class AgentRuntimeService {
    constructor(private readonly orchestrator: AgentRuntimeOrchestrator) {}

    execute(
        createAgentRuntimeDto: ExecuteAgentRuntimeRequest,
        agentId: string,
        workspaceId: string,
    ) {
        return this.orchestrator.execute({
            query: createAgentRuntimeDto.query,
            agentId,
            workspaceId,
        });
    }
}
