import { Injectable } from '@nestjs/common';
import { Agent, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AgentRepository {
    constructor(private readonly prisma: PrismaService) {}

    findOne(id: string, workspaceId: string): Promise<Agent | null> {
        return this.prisma.agent.findFirst({
            where: { id, workspaceId },
        });
    }

    findAll(workspaceId: string): Promise<Agent[]> {
        return this.prisma.agent.findMany({
            where: { workspaceId },
        });
    }

    create(data: Prisma.AgentCreateInput): Promise<Agent | null> {
        return this.prisma.agent.create({ data });
    }

    update(id: string, data: Prisma.AgentUpdateInput): Promise<Agent> {
        return this.prisma.agent.update({ where: { id }, data });
    }

    delete(id: string): Promise<Agent> {
        return this.prisma.agent.delete({ where: { id } });
    }
}
