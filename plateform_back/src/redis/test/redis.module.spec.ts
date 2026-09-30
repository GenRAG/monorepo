import { describe, expect, it, jest } from '@jest/globals';
import Redis from 'ioredis';
import { RedisModule } from 'src/redis/redis.module';

const makeClient = (status: string) =>
    ({
        status,
        quit: jest.fn(() => Promise.resolve('OK')),
        disconnect: jest.fn(),
    }) as unknown as Redis & { quit: jest.Mock; disconnect: jest.Mock };

describe('RedisModule', () => {
    it('closes a connected client gracefully on shutdown', async () => {
        const client = makeClient('ready');

        await new RedisModule(client).onApplicationShutdown();

        expect(client.quit).toHaveBeenCalledTimes(1);
        expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('drops a client that is not connected instead of waiting for a reconnection', async () => {
        const client = makeClient('reconnecting');

        await new RedisModule(client).onApplicationShutdown();

        expect(client.disconnect).toHaveBeenCalledTimes(1);
        expect(client.quit).not.toHaveBeenCalled();
    });
});
