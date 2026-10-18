import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createServer, request, Server } from 'http';
import { AddressInfo } from 'net';
import type { Event, NodeOptions } from '@sentry/nestjs';

jest.mock('@sentry/nestjs', () => {
    const actual = jest.requireActual<typeof import('@sentry/nestjs')>('@sentry/nestjs');
    return { ...actual, init: jest.fn() };
});

import * as Sentry from '@sentry/nestjs';
import 'src/sentry/instrument';

const actualSentry = jest.requireActual<typeof import('@sentry/nestjs')>('@sentry/nestjs');

describe('Sentry instrument', () => {
    const events: Event[] = [];
    let server: Server;

    beforeAll(async () => {
        const options = (Sentry.init as jest.Mock).mock.calls[0][0] as NodeOptions;
        actualSentry.init({
            ...options,
            dsn: 'https://public@example.ingest.sentry.io/1',
            tracesSampleRate: 0,
            transport: () => ({
                send: (envelope) => {
                    for (const [header, payload] of envelope[1]) {
                        if (header.type === 'event') events.push(payload as Event);
                    }
                    return Promise.resolve({});
                },
                flush: () => Promise.resolve(true),
            }),
        });

        server = createServer((req, res) => {
            req.on('data', () => undefined);
            req.on('end', () => {
                actualSentry.captureException(new Error('boom'));
                res.end('ok');
            });
        });
        await new Promise<void>((resolve) => server.listen(0, resolve));
    });

    afterAll(async () => {
        await actualSentry.close();
        await new Promise((resolve) => server.close(resolve));
    });

    it('should not send request bodies: they hold passwords, OTP codes and end-user questions', async () => {
        const { port } = server.address() as AddressInfo;
        await new Promise<void>((resolve, reject) => {
            const req = request(
                { port, method: 'POST', path: '/auth/login', headers: { 'content-type': 'application/json' } },
                (res) => res.on('data', () => undefined).on('end', resolve),
            );
            req.on('error', reject);
            req.end(JSON.stringify({ email: 'owner@test.com', password: 'Password123!' }));
        });
        await actualSentry.flush(2000);

        expect(events).toHaveLength(1);
        expect(events[0].request?.url).toContain('/auth/login');
        expect(events[0].request?.data).toBeUndefined();
    });
});
