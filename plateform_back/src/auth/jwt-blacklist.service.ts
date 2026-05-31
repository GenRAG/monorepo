import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/redis/redis.module';

@Injectable()
export class JwtBlacklistService {
    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

    async blacklist(jti: string, expiresInSeconds: number): Promise<void> {
        await this.redis.set(`jwt:bl:${jti}`, '1', 'EX', expiresInSeconds);
    }

    async isBlacklisted(jti: string): Promise<boolean> {
        return (await this.redis.get(`jwt:bl:${jti}`)) !== null;
    }
}
