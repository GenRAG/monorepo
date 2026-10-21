import { Test, TestingModule } from '@nestjs/testing';
import { CreditBalanceRepository } from '../credit-balance.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockPrismaService: any = {
    creditBalance: {
        findUnique: jest.fn(),
    },
};

describe('CreditBalanceRepository', () => {
    let repository: CreditBalanceRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CreditBalanceRepository, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        repository = module.get<CreditBalanceRepository>(CreditBalanceRepository);
        jest.clearAllMocks();
    });

    describe('getBalance', () => {
        it('should return balance when record exists', async () => {
            mockPrismaService.creditBalance.findUnique.mockResolvedValue({ balance: 100 });

            const result = await repository.getBalance('ws-1');

            expect(result).toBe(100);
            expect(mockPrismaService.creditBalance.findUnique).toHaveBeenCalledWith({ where: { workspaceId: 'ws-1' } });
        });

        it('should return 0 when record does not exist', async () => {
            mockPrismaService.creditBalance.findUnique.mockResolvedValue(null);

            const result = await repository.getBalance('ws-1');

            expect(result).toBe(0);
        });
    });
});
