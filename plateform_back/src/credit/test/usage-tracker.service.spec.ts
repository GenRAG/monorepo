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
        // How the debit splits between the monthly quota and the bought credits is covered on a real database in
        // test/billing.e2e-spec.ts.
        const txWith = () =>
            ({
                $executeRaw: jest.fn() as any,
                agentQueryLog: { create: jest.fn() as any },
            }) as any;
        const debitedAmount = (tx: any) => tx.$executeRaw.mock.calls[0]?.[1];

        it.each([
            ['an answer', QueryLogStatus.SUCCESS, 1],
            ['a query that failed after the RAG engine did paid work', QueryLogStatus.ERROR, 4],
        ])('should debit %s and log it', async (_case, status, creditsUsed) => {
            const tx = txWith();
            mockPrismaService.$transaction.mockImplementation((cb: any) => cb(tx));

            await service.recordQuery({ ...BASE_RECORD, status, creditsUsed });

            expect(debitedAmount(tx)).toBe(creditsUsed);
            expect(tx.agentQueryLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    agentId: 'agent-1',
                    status,
                    creditsUsed,
                }),
            });
        });

        it.each([QueryLogStatus.ERROR, QueryLogStatus.OUT_OF_CREDITS])(
            'should only log, without debit, a %s query that produced nothing',
            async (status) => {
                const tx = txWith();
                mockPrismaService.$transaction.mockImplementation((cb: any) => cb(tx));

                await service.recordQuery({ ...BASE_RECORD, status });

                expect(tx.$executeRaw).not.toHaveBeenCalled();
                expect(tx.agentQueryLog.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({ status, creditsUsed: 0 }),
                });
            },
        );
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
