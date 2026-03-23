import { Injectable } from '@nestjs/common';
import { CreditTransactionType } from 'generated/prisma';
import { JsonObject } from 'generated/prisma/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CreditTransactionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
        workspaceId: string;
        amount: number;
        type: CreditTransactionType;
        metadata?: Record<string, unknown>;
    }) {
        return this.prisma.creditTransaction.create({
            data: {
                workspaceId: data.workspaceId,
                amount: data.amount,
                type: data.type,
                metadata: (data.metadata ?? {}) as JsonObject,
            },
        });
    }

    async findAll(workspaceId: string) {
        return this.prisma.creditTransaction.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
