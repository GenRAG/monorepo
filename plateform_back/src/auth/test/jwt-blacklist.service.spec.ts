import { Test, TestingModule } from '@nestjs/testing';
import { JwtBlacklistService } from 'src/auth/jwt-blacklist.service';
import { REDIS_CLIENT } from 'src/redis/redis.module';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';

const mockRedis = {
    set: jest.fn(),
    get: jest.fn<(key: string) => Promise<string | null>>(),
};

describe('JwtBlacklistService', () => {
    let service: JwtBlacklistService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtBlacklistService, { provide: REDIS_CLIENT, useValue: mockRedis }],
        }).compile();

        service = module.get<JwtBlacklistService>(JwtBlacklistService);
        jest.clearAllMocks();
    });

    describe('blacklist', () => {
        it('should set the jti key with EX TTL', async () => {
            await service.blacklist('test-jti', 3600);

            expect(mockRedis.set).toHaveBeenCalledWith('jwt:bl:test-jti', '1', 'EX', 3600);
        });
    });

    describe('isBlacklisted', () => {
        it('should return true when key exists', async () => {
            mockRedis.get.mockResolvedValue('1');

            const result = await service.isBlacklisted('test-jti');

            expect(result).toBe(true);
            expect(mockRedis.get).toHaveBeenCalledWith('jwt:bl:test-jti');
        });

        it('should return false when key does not exist', async () => {
            mockRedis.get.mockResolvedValue(null);

            const result = await service.isBlacklisted('test-jti');

            expect(result).toBe(false);
        });
    });
});
