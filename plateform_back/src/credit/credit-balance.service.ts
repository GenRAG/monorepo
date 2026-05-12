import { Injectable } from '@nestjs/common';
import { CreditBalanceRepository } from 'src/credit/credit-balance.repository';

export type UpdateCreditBalance = {
    workspaceId: string;
    amount: number;
};

@Injectable()
export class CreditBalanceService {
    constructor(
        private readonly creditBalanceRepository: CreditBalanceRepository,
    ) {}

    async getBalance(workspaceId: string): Promise<number> {
        return this.creditBalanceRepository.getBalance(workspaceId);
    }

    async deduct({ workspaceId, amount }: UpdateCreditBalance): Promise<void> {
        await this.creditBalanceRepository.decrementBalance(
            workspaceId,
            amount,
        );
    }

    async add({ workspaceId, amount }: UpdateCreditBalance): Promise<void> {
        await this.creditBalanceRepository.incrementBalance(
            workspaceId,
            amount,
        );
    }

    async grantInitial({
        workspaceId,
        amount,
    }: UpdateCreditBalance): Promise<void> {
        await this.creditBalanceRepository.incrementOrCreate(
            workspaceId,
            amount,
        );
    }
}
