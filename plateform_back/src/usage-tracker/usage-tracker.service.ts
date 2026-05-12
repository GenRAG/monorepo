import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreditTransactionType } from 'generated/prisma';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsageTrackerService {
    constructor(
        private readonly creditService: CreditBalanceService,
        private readonly prisma: PrismaService,
    ) {}

    async record({ workspaceId, agentId, tokensUsed }) {
        const COST_PER_QUERY = 1;

        await this.prisma.$transaction(async (tx) => {
            const balance = await tx.creditBalance.findUnique({
                where: { workspaceId },
            });

            if (!balance || balance.balance < COST_PER_QUERY) {
                throw new ForbiddenException('Insufficient credits');
            }

            await tx.creditBalance.update({
                where: { workspaceId },
                data: { balance: { decrement: COST_PER_QUERY } },
            });

            await tx.creditTransaction.create({
                data: {
                    workspaceId,
                    amount: COST_PER_QUERY,
                    type: CreditTransactionType.USAGE,
                    metadata: { agentId, tokensUsed: tokensUsed ?? null },
                },
            });
        });
    }

    async checkOrThrow(workspaceId: string): Promise<void> {
        const balance = await this.creditService.getBalance(workspaceId);
        if (balance <= 0) {
            throw new ForbiddenException(
                'Pas de crédits disponibles. Veuillez en acheter pour continuer à utiliser les agents.',
            );
        }
    }
}
