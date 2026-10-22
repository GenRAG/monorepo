import { Injectable } from '@nestjs/common';
import { CreditBalanceRepository } from './credit-balance.repository';
import { CreditTransactionService } from './credit-transaction.service';

@Injectable()
export class CreditBalanceService {
    constructor(
        private readonly creditBalanceRepository: CreditBalanceRepository,
        private readonly creditTransactionService: CreditTransactionService,
    ) {}

    getBalance(workspaceId: string): Promise<number> {
        return this.creditBalanceRepository.getBalance(workspaceId);
    }

    async getBalanceSummary(workspaceId: string): Promise<{ balance: number; totalGranted: number }> {
        const [balance, totalGranted] = await Promise.all([
            this.creditBalanceRepository.getBalance(workspaceId),
            this.creditTransactionService.getTotalGranted(workspaceId),
        ]);
        return { balance, totalGranted };
    }
}
