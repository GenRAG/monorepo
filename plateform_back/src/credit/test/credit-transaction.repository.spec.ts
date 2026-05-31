import { Test, TestingModule } from '@nestjs/testing';
import { CreditTransactionRepository } from '../credit-transaction.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreditTransactionType } from 'generated/prisma';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockPrismaService: any = {
    creditTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
    },
};

describe('CreditTransactionRepository', () => {
    let repository: CreditTransactionRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CreditTransactionRepository, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        repository = module.get<CreditTransactionRepository>(CreditTransactionRepository);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create transaction with all fields', async () => {
            const created = {
                id: 'tx-1',
                workspaceId: 'ws-1',
                amount: 1,
                type: CreditTransactionType.USAGE,
                metadata: { agentId: 'agent-1' },
                createdAt: new Date(),
            };
            mockPrismaService.creditTransaction.create.mockResolvedValue(created);

            const result = await repository.create({
                workspaceId: 'ws-1',
                amount: 1,
                type: CreditTransactionType.USAGE,
                metadata: { agentId: 'agent-1' },
            });

            expect(mockPrismaService.creditTransaction.create).toHaveBeenCalledWith({
                data: {
                    workspaceId: 'ws-1',
                    amount: 1,
                    type: CreditTransactionType.USAGE,
                    metadata: { agentId: 'agent-1' },
                },
            });
            expect(result).toEqual(created);
        });

        it('should create transaction without metadata', async () => {
            mockPrismaService.creditTransaction.create.mockResolvedValue({ id: 'tx-1' });

            await repository.create({
                workspaceId: 'ws-1',
                amount: 100,
                type: CreditTransactionType.SUBSCRIPTION,
            });

            expect(mockPrismaService.creditTransaction.create).toHaveBeenCalledWith({
                data: {
                    workspaceId: 'ws-1',
                    amount: 100,
                    type: CreditTransactionType.SUBSCRIPTION,
                    metadata: {},
                },
            });
        });
    });

    describe('findAll', () => {
        it('should find all transactions ordered by date desc', async () => {
            const transactions = [
                { id: 'tx-3', createdAt: new Date('2026-05-29T12:00:00Z') },
                { id: 'tx-2', createdAt: new Date('2026-05-29T11:00:00Z') },
                { id: 'tx-1', createdAt: new Date('2026-05-29T10:00:00Z') },
            ];
            mockPrismaService.creditTransaction.findMany.mockResolvedValue(transactions);

            const result = await repository.findAll('ws-1');

            expect(mockPrismaService.creditTransaction.findMany).toHaveBeenCalledWith({
                where: { workspaceId: 'ws-1' },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(transactions);
        });

        it('should return empty array when no transactions', async () => {
            mockPrismaService.creditTransaction.findMany.mockResolvedValue([]);

            const result = await repository.findAll('ws-1');

            expect(result).toEqual([]);
        });
    });
});
