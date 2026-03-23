import { Injectable } from '@nestjs/common';
import { CreditTransactionType } from 'generated/prisma';
import { CreditTransactionRepository } from 'src/transaction/credit-transaction.repository';

@Injectable()
export class CreditTransactionService {
    constructor(
        private readonly creditTransactionRepository: CreditTransactionRepository,
    ) {}

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
        return this.creditTransactionRepository.create({
            workspaceId,
            amount,
            type,
            metadata,
        });
    }

    async findAll(workspaceId: string) {
        return this.creditTransactionRepository.findAll(workspaceId);
    }
}
