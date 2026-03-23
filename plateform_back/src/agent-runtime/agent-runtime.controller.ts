import { Controller, Post, Body, Param } from '@nestjs/common';
import { AgentRuntimeService } from './agent-runtime.service';
import { ExecuteAgentRuntimeRequest } from 'src/agent-runtime/dto/create-agent-runtime.request';

@Controller('agent-runtime')
export class AgentRuntimeController {
    constructor(private readonly agentRuntimeService: AgentRuntimeService) {}

    @Post(':workspaceId/:agentId/query')
    create(
        @Param('workspaceId') workspaceId: string,
        @Param('agentId') agentId: string,
        @Body() createAgentRuntimeDto: ExecuteAgentRuntimeRequest,
    ) {
        return this.agentRuntimeService.execute(
            createAgentRuntimeDto,
            agentId,
            workspaceId,
        );
    }
}
