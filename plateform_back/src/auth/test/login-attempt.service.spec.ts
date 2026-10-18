import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { LoginAttemptService } from 'src/auth/login-attempt.service';
import { REDIS_CLIENT } from 'src/redis/redis.module';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';

const mockTransaction = {
    incr: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    exec: jest.fn<() => Promise<[Error | null, unknown][] | null>>(),
};

const mockRedis = {
    multi: jest.fn(() => mockTransaction),
    del: jest.fn(),
};

const mockConfig = {
    get: jest.fn().mockReturnValue(undefined),
};

const countIs = (count: number) =>
    mockTransaction.exec.mockResolvedValue([
        [null, count],
        [null, 1],
    ]);

describe('LoginAttemptService', () => {
    let service: LoginAttemptService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoginAttemptService,
                { provide: REDIS_CLIENT, useValue: mockRedis },
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        service = module.get<LoginAttemptService>(LoginAttemptService);
        jest.clearAllMocks();
        mockConfig.get.mockReturnValue(undefined);
    });

    describe('consume', () => {
        it('should count the attempt and set the TTL only if the key has none, in one transaction', async () => {
            countIs(1);

            await service.consume('login', 'TEST@GENRAG.COM');

            expect(mockTransaction.incr).toHaveBeenCalledWith('auth:attempts:login:test@genrag.com');
            expect(mockTransaction.expire).toHaveBeenCalledWith('auth:attempts:login:test@genrag.com', 900, 'NX');
            expect(mockTransaction.exec).toHaveBeenCalled();
        });

        it('should keep one counter per flow', async () => {
            countIs(1);

            await service.consume('password-reset', 'test@genrag.com');

            expect(mockTransaction.incr).toHaveBeenCalledWith('auth:attempts:password-reset:test@genrag.com');
        });

        it('should allow the 5th attempt (default limit)', async () => {
            countIs(5);

            await expect(service.consume('login', 'test@genrag.com')).resolves.toBeUndefined();
        });

        it('should refuse the 6th attempt', async () => {
            countIs(6);

            await expect(service.consume('login', 'test@genrag.com')).rejects.toThrow(UnauthorizedException);
        });

        it('should refuse when the transaction gives no count', async () => {
            mockTransaction.exec.mockResolvedValue(null);

            await expect(service.consume('login', 'test@genrag.com')).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('reset', () => {
        it('should delete the counter of that flow only', async () => {
            await service.reset('email-verification', 'Test@genrag.com');

            expect(mockRedis.del).toHaveBeenCalledWith('auth:attempts:email-verification:test@genrag.com');
        });
    });
});
