import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Workflow } from 'generated/prisma';
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
            await tx.workflow.updateMany({
                where: { agentId, isActive: true },
                data: { isActive: false },
            });

            const lastWorkflow = await tx.workflow.findFirst({
                where: { agentId },
                orderBy: { version: 'desc' },
            });

            const nextVersion = lastWorkflow ? lastWorkflow.version + 1 : 1;

            return tx.workflow.create({
                data: {
                    agentId,
                    name: createWorkflowRequest.name,
                    definition:
                        createWorkflowRequest.definition as Prisma.InputJsonValue,
                    version: nextVersion,
                    isActive: true,
                },
            });
        });
    }

    async findActive(agentId: string): Promise<Workflow> {
        const workflow = await this.workflowRepository.findActive(agentId);

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        return workflow;
    }

    async update(
        agentId: string,
        updateWorkflowRequest: UpdateWorkflowRequest,
    ): Promise<Workflow> {
        const workflow = await this.workflowRepository.findActive(agentId);

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        return this.workflowRepository.update(workflow.id, {
            ...(updateWorkflowRequest.name !== undefined && {
                name: updateWorkflowRequest.name,
            }),
            ...(updateWorkflowRequest.definition !== undefined && {
                definition:
                    updateWorkflowRequest.definition as Prisma.InputJsonValue,
            }),
        });
    }

    async findAll(agentId: string): Promise<Workflow[]> {
        return this.workflowRepository.findAll(agentId);
    }

    async findOne(id: string, agentId: string): Promise<Workflow> {
        const workflow = await this.workflowRepository.findOne(id, agentId);

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        return workflow;
    }
}
