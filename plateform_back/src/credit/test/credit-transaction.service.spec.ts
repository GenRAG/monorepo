import { Test, TestingModule } from '@nestjs/testing';
import { CreditTransactionService } from '../credit-transaction.service';
import { CreditTransactionRepository } from '../credit-transaction.repository';
import { CreditTransactionType } from 'generated/prisma';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockRepository: any = {
    create: jest.fn(),
    findAll: jest.fn(),
};

describe('CreditTransactionService', () => {
    let service: CreditTransactionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CreditTransactionService, { provide: CreditTransactionRepository, useValue: mockRepository }],
        }).compile();

        service = module.get<CreditTransactionService>(CreditTransactionService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should delegate to repository', async () => {
            const created = { id: 'tx-1', workspaceId: 'ws-1', amount: 1, type: CreditTransactionType.USAGE };
            mockRepository.create.mockResolvedValue(created);

            const result = await service.create({
                workspaceId: 'ws-1',
                amount: 1,
                type: CreditTransactionType.USAGE,
            });

            expect(mockRepository.create).toHaveBeenCalledWith({
                workspaceId: 'ws-1',
                amount: 1,
                type: CreditTransactionType.USAGE,
            });
            expect(result).toEqual(created);
        });

        it('should pass metadata to repository', async () => {
            mockRepository.create.mockResolvedValue({});

            await service.create({
                workspaceId: 'ws-1',
                amount: 100,
                type: CreditTransactionType.PURCHASE,
                metadata: { stripeId: 'stripe_123' },
            });

            expect(mockRepository.create).toHaveBeenCalledWith({
                workspaceId: 'ws-1',
                amount: 100,
                type: CreditTransactionType.PURCHASE,
                metadata: { stripeId: 'stripe_123' },
            });
        });
    });

    describe('findAll', () => {
        it('should return all transactions', async () => {
            const transactions = [{ id: 'tx-1' }, { id: 'tx-2' }];
            mockRepository.findAll.mockResolvedValue(transactions);

            const result = await service.findAll('ws-1');

            expect(mockRepository.findAll).toHaveBeenCalledWith('ws-1');
            expect(result).toEqual(transactions);
        });

        it('should return empty array when no transactions', async () => {
            mockRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll('ws-1');

            expect(result).toEqual([]);
        });
    });
});
