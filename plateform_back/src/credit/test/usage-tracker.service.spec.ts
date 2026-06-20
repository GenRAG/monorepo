import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryLogStatus } from 'generated/prisma';
import { UsageTrackerService } from '../usage-tracker.service';
import { CreditBalanceService } from '../credit-balance.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockCreditService: any = { getBalance: jest.fn() };

const BASE_RECORD = {
    workspaceId: 'ws-1',
    agentId: 'agent-1',
    query: 'test query',
    durationMs: 100,
};

describe('UsageTrackerService', () => {
    let service: UsageTrackerService;
    let mockPrismaService: any;

    beforeEach(async () => {
        mockPrismaService = { $transaction: jest.fn() };

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

    describe('recordQuery', () => {
        it('should debit credits and create log on SUCCESS', async () => {
            const mockTx = {
                creditBalance: {
                    findUnique: (jest.fn() as any).mockResolvedValue({ balance: 10 }),
                    update: (jest.fn() as any).mockResolvedValue({ balance: 9 }),
                },
                agentQueryLog: { create: jest.fn() as any },
            } as any;
            mockPrismaService.$transaction.mockImplementation((cb: any) => cb(mockTx));

            await service.recordQuery({ ...BASE_RECORD, status: QueryLogStatus.SUCCESS });

            expect(mockTx.creditBalance.update).toHaveBeenCalledWith({
                where: { workspaceId: 'ws-1' },
                data: { balance: { decrement: 1 } },
            });
            expect(mockTx.agentQueryLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ agentId: 'agent-1', status: QueryLogStatus.SUCCESS, creditsUsed: 1 }),
            });
        });

        it('should only create log without debit on ERROR', async () => {
            const mockTx = {
                creditBalance: { findUnique: jest.fn() as any, update: jest.fn() as any },
                agentQueryLog: { create: jest.fn() as any },
            } as any;
            mockPrismaService.$transaction.mockImplementation((cb: any) => cb(mockTx));

            await service.recordQuery({ ...BASE_RECORD, status: QueryLogStatus.ERROR });

            expect(mockTx.creditBalance.findUnique).not.toHaveBeenCalled();
            expect(mockTx.creditBalance.update).not.toHaveBeenCalled();
            expect(mockTx.agentQueryLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ status: QueryLogStatus.ERROR, creditsUsed: 0 }),
            });
        });

        it('should only create log without debit on OUT_OF_CREDITS', async () => {
            const mockTx = {
                creditBalance: { findUnique: jest.fn() as any, update: jest.fn() as any },
                agentQueryLog: { create: jest.fn() as any },
            } as any;
            mockPrismaService.$transaction.mockImplementation((cb: any) => cb(mockTx));

            await service.recordQuery({ ...BASE_RECORD, status: QueryLogStatus.OUT_OF_CREDITS });

            expect(mockTx.creditBalance.update).not.toHaveBeenCalled();
            expect(mockTx.agentQueryLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ creditsUsed: 0 }),
            });
        });

        it('should throw ForbiddenException when balance is insufficient on SUCCESS', async () => {
            const mockTx = {
                creditBalance: { findUnique: (jest.fn() as any).mockResolvedValue({ balance: 0 }) },
                agentQueryLog: { create: jest.fn() as any },
            } as any;
            mockPrismaService.$transaction.mockImplementation((cb: any) => cb(mockTx));

            await expect(service.recordQuery({ ...BASE_RECORD, status: QueryLogStatus.SUCCESS })).rejects.toThrow(
                ForbiddenException,
            );
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
