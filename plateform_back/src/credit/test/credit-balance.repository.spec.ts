import { Test, TestingModule } from '@nestjs/testing';
import { CreditTransactionType } from 'generated/prisma';
import { CreditBalanceRepository } from '../credit-balance.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockPrismaService: any = {
    creditBalance: {
        findUnique: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
    },
    creditTransaction: {
        create: jest.fn(),
    },
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
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

    describe('incrementBalance', () => {
        it('should increment balance', async () => {
            mockPrismaService.creditBalance.update.mockResolvedValue({ balance: 150 });

            await repository.incrementBalance('ws-1', 50);

            expect(mockPrismaService.creditBalance.update).toHaveBeenCalledWith({
                where: { workspaceId: 'ws-1' },
                data: { balance: { increment: 50 } },
            });
        });
    });

    describe('incrementOrCreate', () => {
        it('should create balance if not exists', async () => {
            mockPrismaService.creditBalance.upsert.mockResolvedValue({ workspaceId: 'ws-1', balance: 100 });
            mockPrismaService.creditTransaction.create.mockResolvedValue({});

            await repository.incrementOrCreate('ws-1', 100, CreditTransactionType.SUBSCRIPTION);

            expect(mockPrismaService.creditBalance.upsert).toHaveBeenCalledWith({
                where: { workspaceId: 'ws-1' },
                update: { balance: { increment: 100 } },
                create: { workspaceId: 'ws-1', balance: 100 },
            });
        });

        it('should increment balance if exists', async () => {
            mockPrismaService.creditBalance.upsert.mockResolvedValue({ workspaceId: 'ws-1', balance: 200 });
            mockPrismaService.creditTransaction.create.mockResolvedValue({});

            await repository.incrementOrCreate('ws-1', 100, CreditTransactionType.SUBSCRIPTION);

            expect(mockPrismaService.creditBalance.upsert).toHaveBeenCalledWith({
                where: { workspaceId: 'ws-1' },
                update: { balance: { increment: 100 } },
                create: { workspaceId: 'ws-1', balance: 100 },
            });
        });

        it('should also record a credit transaction', async () => {
            mockPrismaService.creditBalance.upsert.mockResolvedValue({ workspaceId: 'ws-1', balance: 100 });
            mockPrismaService.creditTransaction.create.mockResolvedValue({});

            await repository.incrementOrCreate('ws-1', 100, CreditTransactionType.SUBSCRIPTION, { source: 'test' });

            expect(mockPrismaService.creditTransaction.create).toHaveBeenCalledWith({
                data: {
                    workspaceId: 'ws-1',
                    amount: 100,
                    type: CreditTransactionType.SUBSCRIPTION,
                    metadata: { source: 'test' },
                },
            });
        });
    });
});
