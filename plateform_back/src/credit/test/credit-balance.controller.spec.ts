import { CreditBalanceController } from '../credit-balance.controller';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockCreditBalanceService: any = {
    getBalance: jest.fn(),
    add: jest.fn(),
};

describe('CreditBalanceController', () => {
    let controller: CreditBalanceController;

    beforeEach(() => {
        controller = new CreditBalanceController(mockCreditBalanceService);
        jest.clearAllMocks();
    });

    describe('getBalance', () => {
        it('should delegate to service', async () => {
            mockCreditBalanceService.getBalance.mockResolvedValue(500);

            const result = await controller.getBalance('ws-1');

            expect(mockCreditBalanceService.getBalance).toHaveBeenCalledWith('ws-1');
            expect(result).toBe(500);
        });

        it('should return 0 when balance is empty', async () => {
            mockCreditBalanceService.getBalance.mockResolvedValue(0);

            const result = await controller.getBalance('ws-1');

            expect(result).toBe(0);
        });
    });

    describe('addCredit', () => {
        it('should add credits with workspace and amount', async () => {
            mockCreditBalanceService.add.mockResolvedValue(undefined);

            await controller.addCredit('ws-1', { amount: 1000 });

            expect(mockCreditBalanceService.add).toHaveBeenCalledWith({
                workspaceId: 'ws-1',
                amount: 1000,
            });
        });

        it('should handle various amounts', async () => {
            mockCreditBalanceService.add.mockResolvedValue(undefined);

            await controller.addCredit('ws-1', { amount: 5000 });

            expect(mockCreditBalanceService.add).toHaveBeenCalledWith({
                workspaceId: 'ws-1',
                amount: 5000,
            });
        });

        it('should accept minimum amount (1)', async () => {
            mockCreditBalanceService.add.mockResolvedValue(undefined);

            await controller.addCredit('ws-1', { amount: 1 });

            expect(mockCreditBalanceService.add).toHaveBeenCalledWith({
                workspaceId: 'ws-1',
                amount: 1,
            });
        });
    });
});
