import { Injectable } from '@nestjs/common';
import { JsonValue } from 'generated/prisma/runtime/library';
import { AgentService } from 'src/agent/agent.service';
import { WorkflowService } from 'src/workflow/workflow.service';

@Injectable()
export class ContextBuilder {
    constructor(
        private readonly agentService: AgentService,
        private readonly workflowService: WorkflowService,
    ) {}

    async buildPipeline({
        agentId,
        workspaceId,
    }: {
        agentId: string;
        workspaceId: string;
    }): Promise<JsonValue> {
        const agent = await this.agentService.findOne(agentId, workspaceId);
        const workflow = await this.workflowService.findActive(agent.id);

        if (!workflow) {
            throw new Error('No active workflow found for this agent');
        }

        return workflow.definition;
    }
}
