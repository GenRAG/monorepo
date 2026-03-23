// src/credit/credit-transaction.service.ts
import { Injectable } from '@nestjs/common';
import { CreditTransactionType, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CreditTransactionService {
    constructor(private readonly prisma: PrismaService) {}

    async create({
        workspaceId,
        amount,
        type,
        metadata,
    }: {
        workspaceId: string;
        amount: number;
        type: CreditTransactionType;
        metadata?: Record<string, unknown>;
    }) {
        return this.prisma.creditTransaction.create({
            data: {
                workspaceId,
                amount,
                type,
                metadata: (metadata ?? {}) as Prisma.JsonObject,
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
