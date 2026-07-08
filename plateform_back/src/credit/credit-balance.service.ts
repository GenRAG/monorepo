import { Injectable } from '@nestjs/common';
import { CreditTransactionType } from 'generated/prisma';
import { CreditBalanceRepository } from './credit-balance.repository';
import { CreditTransactionService } from './credit-transaction.service';

export type UpdateCreditBalance = {
    workspaceId: string;
    amount: number;
};

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

    async add({ workspaceId, amount }: UpdateCreditBalance): Promise<void> {
        await this.creditBalanceRepository.incrementBalance(workspaceId, amount);
    }

    async grantInitial(
        { workspaceId, amount }: UpdateCreditBalance,
        type: CreditTransactionType = CreditTransactionType.SUBSCRIPTION,
        metadata?: Record<string, unknown>,
    ): Promise<void> {
        await this.creditBalanceRepository.incrementOrCreate(workspaceId, amount, type, metadata);
    }
}
