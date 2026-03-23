import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreditTransactionType } from 'generated/prisma';
import { CreditBalanceService } from 'src/credit/credit-balance.service';
import { CreditTransactionService } from 'src/transaction/credit-transaction.service';

@Injectable()
export class UsageTrackerService {
    constructor(
        private readonly creditService: CreditBalanceService,
        private readonly creditTransactionService: CreditTransactionService,
    ) {}

    async record({
        workspaceId,
        agentId,
        tokensUsed,
    }: {
        workspaceId: string;
        agentId: string;
        tokensUsed?: number;
    }): Promise<void> {
        const COST_PER_QUERY = 1;

        await this.creditService.deduct({
            workspaceId,
            amount: COST_PER_QUERY,
        });

        await this.creditTransactionService.create({
            workspaceId,
            amount: COST_PER_QUERY,
            type: CreditTransactionType.USAGE,
            metadata: { agentId, tokensUsed: tokensUsed ?? null },
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
