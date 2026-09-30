import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService],
            useFactory: (config: ConfigService): Redis => {
                const isProduction = config.get('NODE_ENV') === 'production';
                if (isProduction) {
                    return new Redis(config.getOrThrow<string>('REDIS_URL'));
                }
                return new Redis({
                    host: config.get('REDIS_HOST') ?? 'localhost',
                    port: Number(config.get('REDIS_PORT') ?? 6379),
                });
            },
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

    // The client is a factory provider: Nest does not close it, so without this the open socket keeps the
    // process alive after app.close() (e2e Jest never exits, graceful shutdown hangs).
    async onApplicationShutdown(): Promise<void> {
        if (this.redis.status === 'ready') {
            await this.redis.quit();
        } else {
            // quit() would wait for a reconnection that may never come.
            this.redis.disconnect();
        }
    }
}
