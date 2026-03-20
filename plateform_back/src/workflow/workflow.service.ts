import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkflowRequest } from 'src/workflow/dto/create-workflow.request';
import { UpdateWorkflowRequest } from 'src/workflow/dto/update-workflow.request';

@Injectable()
export class WorkflowService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(
        agentId: string,
        createWorkflowRequest: CreateWorkflowRequest,
    ) {
        return this.prismaService.$transaction(async (tx) => {
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
        const workflow = await this.prismaService.workflow.findFirst({
            where: { agentId },
            orderBy: { version: 'desc' },
        });

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        return workflow;
    }

    async update(
        agentId: string,
        updateWorkflowRequest: UpdateWorkflowRequest,
    ) {
        const workflow = await this.prismaService.workflow.findFirst({
            where: { agentId },
            orderBy: { version: 'desc' },
        });

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        return this.prismaService.workflow.update({
            where: { id: workflow.id },
            data: { ...updateWorkflowRequest },
        });
    }

    async findAll(agentId: string) {
        const workflows = await this.prismaService.workflow.findMany({
            where: { agentId },
            orderBy: { version: 'desc' },
        });

        if (workflows.length === 0) {
            throw new NotFoundException('Workflows not found');
        }

        return workflows;
    }

    async findOne(id: string, agentId: string) {
        const workflow = await this.prismaService.workflow.findUnique({
            where: { id, agentId },
        });

        if (!workflow) {
            throw new NotFoundException('Workflow not found');
        }

        return workflow;
    }
}
