import { Injectable } from '@nestjs/common';
import { Prisma, Workflow } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkflowRepository {
    constructor(private readonly prisma: PrismaService) {}

    findActive(agentId: string): Promise<Workflow | null> {
        return this.prisma.workflow.findFirst({
            where: { agentId, isActive: true },
        });
    }

    findAll(agentId: string): Promise<Workflow[]> {
        return this.prisma.workflow.findMany({
            where: { agentId },
            orderBy: { version: 'desc' },
        });
    }

    findOne(id: string, agentId: string): Promise<Workflow | null> {
        return this.prisma.workflow.findFirst({
            where: { id, agentId },
        });
    }

    findByVersion(agentId: string, version: number): Promise<Workflow | null> {
        return this.prisma.workflow.findFirst({
            where: { agentId, version },
        });
    }

    update(id: string, data: Prisma.WorkflowUpdateInput): Promise<Workflow> {
        return this.prisma.workflow.update({ where: { id }, data });
    }

    activate(id: string, agentId: string): Promise<Workflow> {
        return this.prisma.$transaction(async (tx) => {
            await tx.workflow.updateMany({
                where: { agentId, isActive: true },
                data: { isActive: false },
            });

            return tx.workflow.update({
                where: { id },
                data: { isActive: true },
            });
        });
    }

    transaction<T>(
        fn: (tx: Prisma.TransactionClient) => Promise<T>,
    ): Promise<T> {
        return this.prisma.$transaction(fn);
    }
}
