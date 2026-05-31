import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsageTrackerService } from '../usage-tracker.service';
import { CreditBalanceService } from '../credit-balance.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreditTransactionType } from 'generated/prisma';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockCreditService: any = {
    getBalance: jest.fn(),
};

describe('UsageTrackerService', () => {
    let service: UsageTrackerService;
    let mockPrismaService: any;

    beforeEach(async () => {
        mockPrismaService = {
            $transaction: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsageTrackerService,
                { provide: CreditBalanceService, useValue: mockCreditService },
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<UsageTrackerService>(UsageTrackerService);
        jest.clearAllMocks();
    });

    describe('record', () => {
        it('should deduct credit and log transaction on success', async () => {
            const mockTx = {
                creditBalance: {
                    findUnique: (jest.fn() as any).mockResolvedValue({ balance: 10 }),
                    update: (jest.fn() as any).mockResolvedValue({ balance: 9 }),
                },
                creditTransaction: { create: (jest.fn() as any).mockResolvedValue({ id: 'tx-1' }) },
            } as any;
            mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

            await service.record({
                workspaceId: 'ws-1',
                agentId: 'agent-1',
                tokensUsed: 100,
            });

            expect(mockTx.creditBalance.findUnique).toHaveBeenCalledWith({ where: { workspaceId: 'ws-1' } });
            expect(mockTx.creditBalance.update).toHaveBeenCalledWith({
                where: { workspaceId: 'ws-1' },
                data: { balance: { decrement: 1 } },
            });
            expect(mockTx.creditTransaction.create).toHaveBeenCalledWith({
                data: {
                    workspaceId: 'ws-1',
                    amount: 1,
                    type: CreditTransactionType.USAGE,
                    metadata: { agentId: 'agent-1', tokensUsed: 100 },
                },
            });
        });

        it('should throw ForbiddenException when balance is insufficient', async () => {
            const mockTx = {
                creditBalance: { findUnique: (jest.fn() as any).mockResolvedValue({ balance: 0 }) },
            } as any;
            mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

            await expect(service.record({ workspaceId: 'ws-1', agentId: 'agent-1' })).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should throw when balance record does not exist', async () => {
            const mockTx = {
                creditBalance: { findUnique: (jest.fn() as any).mockResolvedValue(null) },
            } as any;
            mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

            await expect(service.record({ workspaceId: 'ws-1', agentId: 'agent-1' })).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should handle tokensUsed as optional', async () => {
            const mockTx = {
                creditBalance: {
                    findUnique: (jest.fn() as any).mockResolvedValue({ balance: 10 }),
                    update: jest.fn() as any,
                },
                creditTransaction: { create: jest.fn() as any },
            } as any;
            mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

            await service.record({
                workspaceId: 'ws-1',
                agentId: 'agent-1',
            });

            expect(mockTx.creditTransaction.create).toHaveBeenCalledWith({
                data: {
                    workspaceId: 'ws-1',
                    amount: 1,
                    type: CreditTransactionType.USAGE,
                    metadata: { agentId: 'agent-1', tokensUsed: null },
                },
            });
        });
    });

    describe('checkOrThrow', () => {
        it('should not throw when balance > 0', async () => {
            mockCreditService.getBalance.mockResolvedValue(100);

            await expect(service.checkOrThrow('ws-1')).resolves.toBeUndefined();
        });

        it('should throw ForbiddenException when balance is 0', async () => {
            mockCreditService.getBalance.mockResolvedValue(0);

            await expect(service.checkOrThrow('ws-1')).rejects.toThrow(ForbiddenException);
            await expect(service.checkOrThrow('ws-1')).rejects.toThrow(
                'Pas de crédits disponibles. Veuillez en acheter',
            );
        });

        it('should throw ForbiddenException when balance < 0', async () => {
            mockCreditService.getBalance.mockResolvedValue(-5);

            await expect(service.checkOrThrow('ws-1')).rejects.toThrow(ForbiddenException);
        });

        it('should not throw when balance is 1 (boundary)', async () => {
            mockCreditService.getBalance.mockResolvedValue(1);

            await expect(service.checkOrThrow('ws-1')).resolves.toBeUndefined();
        });
    });
});
