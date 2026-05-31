import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/redis/redis.module';

@Injectable()
export class LoginAttemptService {
    private readonly maxAttempts: number;
    private readonly blockTtlSeconds: number;

    constructor(
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly config: ConfigService,
    ) {
        this.maxAttempts = Number(this.config.get('AUTH_MAX_LOGIN_ATTEMPTS') ?? 5);
        this.blockTtlSeconds = Number(this.config.get('AUTH_BLOCK_TTL_SECONDS') ?? 900);
    }

    private key(email: string): string {
        return `login:attempts:${email.toLowerCase()}`;
    }

    async isBlocked(email: string): Promise<boolean> {
        const count = await this.redis.get(this.key(email));
        return count !== null && Number(count) >= this.maxAttempts;
    }

    async recordFailure(email: string): Promise<void> {
        const key = this.key(email);
        const count = await this.redis.incr(key);
        if (count === 1) {
            await this.redis.expire(key, this.blockTtlSeconds);
        }
    }

    async reset(email: string): Promise<void> {
        await this.redis.del(this.key(email));
    }
}
