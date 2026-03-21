import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkflowRepository {
    constructor(private readonly prisma: PrismaService) {}

    findActive(agentId: string) {
        return this.prisma.workflow.findFirst({
            where: { agentId },
            orderBy: { version: 'desc' },
        });
    }

    findAll(agentId: string) {
        return this.prisma.workflow.findMany({
            where: { agentId },
            orderBy: { version: 'desc' },
        });
    }

    findOne(id: string, agentId: string) {
        return this.prisma.workflow.findFirst({
            where: { id, agentId },
        });
    }

    create(data: Prisma.WorkflowCreateInput) {
        return this.prisma.workflow.create({ data });
    }

    update(id: string, data: Prisma.WorkflowUpdateInput) {
        return this.prisma.workflow.update({ where: { id }, data });
    }

    transaction<T>(
        fn: (tx: Prisma.TransactionClient) => Promise<T>,
    ): Promise<T> {
        return this.prisma.$transaction(fn);
    }
}
