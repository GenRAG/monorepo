import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkflowRequest } from 'src/workflow/dto/create-workflow.request';
import { UpdateWorkflowRequest } from 'src/workflow/dto/update-workflow.request';
import { WorkflowRepository } from 'src/workflow/workflow.repository';

@Injectable()
export class WorkflowService {
    constructor(private readonly workflowRepository: WorkflowRepository) {}

    async create(
        agentId: string,
        createWorkflowRequest: CreateWorkflowRequest,
    ) {
        return this.workflowRepository.transaction(async (tx) => {
            const lastWorkflow = await tx.workflow.findFirst({
                where: { agentId },
                orderBy: { version: 'desc' },
            });

            const nextVersion = lastWorkflow ? lastWorkflow.version + 1 : 1;

            return tx.workflow.create({
                data: {
                    agentId,
                    name: createWorkflowRequest.name,
                    definition: createWorkflowRequest.definition,
                    version: nextVersion,
                },
            });
        });
    }

    async findActive(agentId: string) {
        const workflow = await this.workflowRepository.findActive(agentId);

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        return workflow;
    }

    async update(
        agentId: string,
        updateWorkflowRequest: UpdateWorkflowRequest,
    ) {
        const workflow = await this.workflowRepository.findActive(agentId);

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        return this.workflowRepository.update(
            workflow.id,
            updateWorkflowRequest,
        );
    }

    async findAll(agentId: string) {
        return this.workflowRepository.findAll(agentId);
    }

    async findOne(id: string, agentId: string) {
        const workflow = await this.workflowRepository.findOne(id, agentId);

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        return workflow;
    }
}
