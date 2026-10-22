import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CreditBalanceRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getBalance(workspaceId: string): Promise<number> {
        const record = await this.prisma.creditBalance.findUnique({ where: { workspaceId } });
        return record?.balance ?? 0;
    }
}
