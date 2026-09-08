import { Injectable } from '@nestjs/common';
import { CreditTransactionType, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CreditBalanceRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getBalance(workspaceId: string): Promise<number> {
        const record = await this.prisma.creditBalance.findUnique({ where: { workspaceId } });
        return record?.balance ?? 0;
    }

    async incrementOrCreate(
        workspaceId: string,
        amount: number,
        type: CreditTransactionType,
        metadata?: Record<string, unknown>,
    ): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.creditBalance.upsert({
                where: { workspaceId },
                update: { balance: { increment: amount } },
                create: { workspaceId, balance: amount },
            }),
            this.prisma.creditTransaction.create({
                data: { workspaceId, amount, type, metadata: (metadata ?? {}) as Prisma.InputJsonObject },
            }),
        ]);
    }
}
