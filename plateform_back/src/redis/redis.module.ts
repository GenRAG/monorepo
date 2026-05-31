import { Global, Module } from '@nestjs/common';
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
export class RedisModule {}
