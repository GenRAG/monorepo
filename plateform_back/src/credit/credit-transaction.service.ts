import { Injectable } from '@nestjs/common';
import { CreditTransactionType } from 'generated/prisma';
import { CreditTransactionRepository } from './credit-transaction.repository';

@Injectable()
export class CreditTransactionService {
    constructor(private readonly creditTransactionRepository: CreditTransactionRepository) {}

    create(data: {
        workspaceId: string;
        amount: number;
        type: CreditTransactionType;
        metadata?: Record<string, unknown>;
    }) {
        return this.creditTransactionRepository.create(data);
    }

    findAll(workspaceId: string) {
        return this.creditTransactionRepository.findAll(workspaceId);
    }

    /** Whether the workspace already received credits tagged with this `metadata.source`. */
    hasGrantFrom(workspaceId: string, source: string): Promise<boolean> {
        return this.creditTransactionRepository.existsFromSource(workspaceId, source);
    }

    getTotalGranted(workspaceId: string): Promise<number> {
        return this.creditTransactionRepository.sumGranted(workspaceId);
    }
}
