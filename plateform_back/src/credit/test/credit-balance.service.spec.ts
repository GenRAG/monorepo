import { Test, TestingModule } from '@nestjs/testing';
import { CreditTransactionType } from 'generated/prisma';
import { CreditBalanceService } from '../credit-balance.service';
import { CreditBalanceRepository } from '../credit-balance.repository';
import { CreditTransactionService } from '../credit-transaction.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockRepository: any = {
    getBalance: jest.fn(),
    incrementOrCreate: jest.fn(),
};

const mockCreditTransactionService: any = {
    getTotalGranted: jest.fn(),
};

describe('CreditBalanceService', () => {
    let service: CreditBalanceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreditBalanceService,
                { provide: CreditBalanceRepository, useValue: mockRepository },
                { provide: CreditTransactionService, useValue: mockCreditTransactionService },
            ],
        }).compile();

        service = module.get<CreditBalanceService>(CreditBalanceService);
        jest.clearAllMocks();
    });

    describe('getBalance', () => {
        it('should delegate to repository', async () => {
            mockRepository.getBalance.mockResolvedValue(250);

            const result = await service.getBalance('ws-1');

            expect(result).toBe(250);
            expect(mockRepository.getBalance).toHaveBeenCalledWith('ws-1');
        });

        it('should return 0 when no balance', async () => {
            mockRepository.getBalance.mockResolvedValue(0);

            const result = await service.getBalance('ws-1');

            expect(result).toBe(0);
        });
    });

    describe('grantInitial', () => {
        it('should grant initial credits with upsert', async () => {
            mockRepository.incrementOrCreate.mockResolvedValue(undefined);

            await service.grantInitial({ workspaceId: 'ws-1', amount: 100 });

            expect(mockRepository.incrementOrCreate).toHaveBeenCalledWith(
                'ws-1',
                100,
                CreditTransactionType.SUBSCRIPTION,
                undefined,
            );
        });

        it('should create balance if not exists', async () => {
            mockRepository.incrementOrCreate.mockResolvedValue(undefined);

            await service.grantInitial({ workspaceId: 'new-ws', amount: 50 });

            expect(mockRepository.incrementOrCreate).toHaveBeenCalledWith(
                'new-ws',
                50,
                CreditTransactionType.SUBSCRIPTION,
                undefined,
            );
        });

        it('should forward a custom type and metadata', async () => {
            mockRepository.incrementOrCreate.mockResolvedValue(undefined);

            await service.grantInitial({ workspaceId: 'ws-1', amount: 20 }, CreditTransactionType.SUBSCRIPTION, {
                source: 'onboarding_bonus',
            });

            expect(mockRepository.incrementOrCreate).toHaveBeenCalledWith(
                'ws-1',
                20,
                CreditTransactionType.SUBSCRIPTION,
                {
                    source: 'onboarding_bonus',
                },
            );
        });
    });

    describe('getBalanceSummary', () => {
        it('should combine balance and total granted', async () => {
            mockRepository.getBalance.mockResolvedValue(2520);
            mockCreditTransactionService.getTotalGranted.mockResolvedValue(2520);

            const result = await service.getBalanceSummary('ws-1');

            expect(result).toEqual({ balance: 2520, totalGranted: 2520 });
        });
    });
});
