import { CreditBalanceController } from '../credit-balance.controller';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

const mockCreditBalanceService: any = {
    getBalance: jest.fn(),
    getBalanceSummary: jest.fn(),
};

describe('CreditBalanceController', () => {
    let controller: CreditBalanceController;

    beforeEach(() => {
        controller = new CreditBalanceController(mockCreditBalanceService);
        jest.clearAllMocks();
    });

    describe('getBalance', () => {
        it('should delegate to service', async () => {
            mockCreditBalanceService.getBalanceSummary.mockResolvedValue({ balance: 500, totalGranted: 500 });

            const result = await controller.getBalance('ws-1');

            expect(mockCreditBalanceService.getBalanceSummary).toHaveBeenCalledWith('ws-1');
            expect(result).toEqual({ balance: 500, totalGranted: 500 });
        });

        it('should return 0 when balance is empty', async () => {
            mockCreditBalanceService.getBalanceSummary.mockResolvedValue({ balance: 0, totalGranted: 0 });

            const result = await controller.getBalance('ws-1');

            expect(result).toEqual({ balance: 0, totalGranted: 0 });
        });
    });
});
