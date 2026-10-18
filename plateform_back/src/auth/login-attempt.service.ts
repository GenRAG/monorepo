import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/redis/redis.module';

/** Each flow has its own counter: a successful login must not reset the guesses of an OTP code. */
export type AttemptFlow = 'login' | 'email-verification' | 'password-reset';

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

    private key(flow: AttemptFlow, email: string): string {
        return `auth:attempts:${flow}:${email.toLowerCase()}`;
    }

    /**
     * Counts this attempt before it is checked, in one Redis transaction, and refuses it past the limit: parallel
     * requests can no longer all read a counter below the limit. Call `reset` once the attempt succeeds.
     * `SET NX EX` starts the window on the first attempt (`EXPIRE ... NX` would need Redis 7).
     */
    async consume(flow: AttemptFlow, email: string): Promise<void> {
        const key = this.key(flow, email);
        const results = await this.redis.multi().set(key, 0, 'EX', this.blockTtlSeconds, 'NX').incr(key).exec();
        const error = results?.find(([err]) => err)?.[0];
        if (error) throw error;
        const count = Number(results?.[1]?.[1]);
        if (!(count <= this.maxAttempts)) {
            throw new UnauthorizedException('Too many failed attempts. Try again later.');
        }
    }

    async reset(flow: AttemptFlow, email: string): Promise<void> {
        await this.redis.del(this.key(flow, email));
    }
}
