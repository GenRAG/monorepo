import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CreditBalanceRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getBalance(workspaceId: string): Promise<number> {
        const record = await this.prisma.creditBalance.findUnique({ where: { workspaceId } });
        return record?.balance ?? 0;
    }

    async incrementBalance(workspaceId: string, amount: number): Promise<void> {
        await this.prisma.creditBalance.update({
            where: { workspaceId },
            data: { balance: { increment: amount } },
        });
    }

    async incrementOrCreate(workspaceId: string, amount: number): Promise<void> {
        await this.prisma.creditBalance.upsert({
            where: { workspaceId },
            update: { balance: { increment: amount } },
            create: { workspaceId, balance: amount },
        });
    }
}
