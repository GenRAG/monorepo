import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
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
    }): Promise<Prisma.JsonValue> {
        const agent = await this.agentService.findOne(agentId, workspaceId);
        const workflow = await this.workflowService.findActive(agent.id);

        if (!workflow) {
            throw new Error('No active workflow found for this agent');
        }

        const def = workflow.definition as Record<string, unknown>;
        // New format: { nodes, edges, blocks } — return only the blocks array for the RAG API.
        // Fall back to the full definition for legacy workflows stored in the old pipeline format.
        return (def.blocks as Prisma.JsonValue) ?? workflow.definition;
    }
}
