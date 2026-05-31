import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoginAttemptService } from 'src/auth/login-attempt.service';
import { REDIS_CLIENT } from 'src/redis/redis.module';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';

const mockRedis = {
    get: jest.fn<(key: string) => Promise<string | null>>(),
    incr: jest.fn<(key: string) => Promise<number>>(),
    expire: jest.fn(),
    del: jest.fn(),
};

const mockConfig = {
    get: jest.fn().mockReturnValue(undefined),
};

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

    describe('isBlocked', () => {
        it('should return false when no key exists in Redis', async () => {
            mockRedis.get.mockResolvedValue(null);

            expect(await service.isBlocked('test@genrag.com')).toBe(false);
        });

        it('should return false when count is below max attempts', async () => {
            mockRedis.get.mockResolvedValue('3');

            expect(await service.isBlocked('test@genrag.com')).toBe(false);
        });

        it('should return true when count reaches max attempts (default 5)', async () => {
            mockRedis.get.mockResolvedValue('5');

            expect(await service.isBlocked('test@genrag.com')).toBe(true);
        });

        it('should use email key in lowercase', async () => {
            mockRedis.get.mockResolvedValue(null);

            await service.isBlocked('TEST@GENRAG.COM');

            expect(mockRedis.get).toHaveBeenCalledWith('login:attempts:test@genrag.com');
        });
    });

    describe('recordFailure', () => {
        it('should set TTL when it is the first failure', async () => {
            mockRedis.incr.mockResolvedValue(1);

            await service.recordFailure('test@genrag.com');

            expect(mockRedis.incr).toHaveBeenCalledWith('login:attempts:test@genrag.com');
            expect(mockRedis.expire).toHaveBeenCalledWith('login:attempts:test@genrag.com', expect.any(Number));
        });

        it('should not reset TTL on subsequent failures', async () => {
            mockRedis.incr.mockResolvedValue(3);

            await service.recordFailure('test@genrag.com');

            expect(mockRedis.expire).not.toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('should delete the key', async () => {
            await service.reset('test@genrag.com');

            expect(mockRedis.del).toHaveBeenCalledWith('login:attempts:test@genrag.com');
        });
    });
});
