import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentRequest } from './dto/create-agent.request';
import { UpdateAgentRequest } from './dto/update-agent.request';
import { Agent, AgentStatus } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AgentService {
    constructor(private readonly prismaService: PrismaService) {}

    async insertOne(
        createAgentRequest: CreateAgentRequest,
        userId: string,
        workspaceId: string,
    ): Promise<Agent> {
        const { name, description } = createAgentRequest;

        return this.prismaService.agent.create({
            data: {
                name,
                description: description ?? '',
                workspaceId,
                createdBy: userId,
                updatedBy: userId,
                status: AgentStatus.DEVELOPMENT,
            },
        });
    }

    async findAll(workspaceId: string): Promise<Agent[]> {
        return this.prismaService.agent.findMany({
            where: { workspaceId },
        });
    }

    async findOne(id: string, workspaceId: string): Promise<Agent> {
        const agent = await this.prismaService.agent.findFirst({
            where: { id, workspaceId },
        });

        if (!agent) {
            throw new NotFoundException('Agent not found');
        }

        return agent;
    }

    async update(
        id: string,
        workspaceId: string,
        updateAgentDto: UpdateAgentRequest,
        userId: string,
    ): Promise<Agent> {
        const agent = await this.prismaService.agent.findFirst({
            where: { id, workspaceId },
        });

        if (!agent) {
            throw new NotFoundException('Agent not found');
        }

        return this.prismaService.agent.update({
            where: { id },
            data: {
                ...updateAgentDto,
                updatedBy: userId,
            },
        });
    }

    async remove(id: string, workspaceId: string): Promise<Agent> {
        const agent = await this.prismaService.agent.findFirst({
            where: { id, workspaceId },
        });

        if (!agent) {
            throw new NotFoundException('Agent not found');
        }

        return this.prismaService.agent.delete({
            where: { id },
        });
    }
}
