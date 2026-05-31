import { Test, TestingModule } from '@nestjs/testing';
import { CreditBalanceService } from '../credit-balance.service';
import { CreditBalanceRepository } from '../credit-balance.repository';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockRepository: any = {
    getBalance: jest.fn(),
    incrementBalance: jest.fn(),
    incrementOrCreate: jest.fn(),
};

describe('CreditBalanceService', () => {
    let service: CreditBalanceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CreditBalanceService, { provide: CreditBalanceRepository, useValue: mockRepository }],
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

    describe('add', () => {
        it('should add credits via repository', async () => {
            mockRepository.incrementBalance.mockResolvedValue(undefined);

            await service.add({ workspaceId: 'ws-1', amount: 100 });

            expect(mockRepository.incrementBalance).toHaveBeenCalledWith('ws-1', 100);
        });

        it('should handle various amounts', async () => {
            mockRepository.incrementBalance.mockResolvedValue(undefined);

            await service.add({ workspaceId: 'ws-1', amount: 5000 });

            expect(mockRepository.incrementBalance).toHaveBeenCalledWith('ws-1', 5000);
        });
    });

    describe('grantInitial', () => {
        it('should grant initial credits with upsert', async () => {
            mockRepository.incrementOrCreate.mockResolvedValue(undefined);

            await service.grantInitial({ workspaceId: 'ws-1', amount: 100 });

            expect(mockRepository.incrementOrCreate).toHaveBeenCalledWith('ws-1', 100);
        });

        it('should create balance if not exists', async () => {
            mockRepository.incrementOrCreate.mockResolvedValue(undefined);

            await service.grantInitial({ workspaceId: 'new-ws', amount: 50 });

            expect(mockRepository.incrementOrCreate).toHaveBeenCalledWith('new-ws', 50);
        });
    });
});
