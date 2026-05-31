import { Injectable } from '@nestjs/common';
import { CreditBalanceRepository } from './credit-balance.repository';

export type UpdateCreditBalance = {
    workspaceId: string;
    amount: number;
};

@Injectable()
export class CreditBalanceService {
    constructor(private readonly creditBalanceRepository: CreditBalanceRepository) {}

    getBalance(workspaceId: string): Promise<number> {
        return this.creditBalanceRepository.getBalance(workspaceId);
    }

    async add({ workspaceId, amount }: UpdateCreditBalance): Promise<void> {
        await this.creditBalanceRepository.incrementBalance(workspaceId, amount);
    }

    async grantInitial({ workspaceId, amount }: UpdateCreditBalance): Promise<void> {
        await this.creditBalanceRepository.incrementOrCreate(workspaceId, amount);
    }
}
