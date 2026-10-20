import { INestApplication } from '@nestjs/common';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { TEST_USER } from './helpers/auth.helper';
import { REDIS_CLIENT } from '../src/redis/redis.module';
import Redis from 'ioredis';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let redis: Redis;

    beforeAll(async () => {
        app = await createTestApp();
        redis = app.get<Redis>(REDIS_CLIENT);
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app.getHttpServer()).post('/auth/register').send(TEST_USER).expect(201);

            expect(res.body).not.toHaveProperty('password');
        });

        it('should return 409 if email already exists', async () => {
            await request(app.getHttpServer()).post('/auth/register').send(TEST_USER).expect(409);
        });

        it('should fail with invalid email', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'not-an-email', password: 'Password123!' })
                .expect(400);
        });

        it('should fail with weak password', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'new@test.com', password: '123' })
                .expect(400);
        });
    });

    describe('POST /auth/login', () => {
        it('should login and set an httpOnly cookie', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: TEST_USER.email, password: TEST_USER.password })
                .expect(201);

            const cookie = res.headers['set-cookie'] as unknown as string[];
            expect(cookie).toBeDefined();
            expect(cookie[0]).toContain('Authentication');
            expect(cookie[0]).toContain('HttpOnly');
        });

        it('should return a JWT containing a jti claim', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: TEST_USER.email, password: TEST_USER.password });

            const cookieHeader: string = (res.headers['set-cookie'] as unknown as string[])[0];
            const tokenMatch = cookieHeader.match(/Authentication=([^;]+)/);
            expect(tokenMatch).not.toBeNull();

            const [, payload] = tokenMatch![1].split('.');
            const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
            expect(decoded).toHaveProperty('userId');
            expect(decoded).toHaveProperty('jti');
            expect(typeof decoded.jti).toBe('string');
            expect(decoded.jti).toHaveLength(36);
        });

        it('should fail with wrong password', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: TEST_USER.email, password: 'WrongPassword123!' })
                .expect(401);
        });

        it('should fail with unknown email', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'unknown@test.com', password: 'Password123!' })
                .expect(401);
        });
    });

    describe('POST /auth/logout + JWT blacklist', () => {
        let cookie: string;

        beforeEach(async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: TEST_USER.email, password: TEST_USER.password });
            cookie = (res.headers['set-cookie'] as unknown as string[])[0];
        });

        it('should return 200 on a protected route before logout', async () => {
            await request(app.getHttpServer()).get('/users/me').set('Cookie', cookie).expect(200);
        });

        it('should blacklist the token and return 401 on subsequent requests', async () => {
            await request(app.getHttpServer()).post('/auth/logout').set('Cookie', cookie).expect(201);

            await request(app.getHttpServer()).get('/users/me').set('Cookie', cookie).expect(401);
        });

        it('should succeed even without a cookie (idempotent logout)', async () => {
            await request(app.getHttpServer()).post('/auth/logout').expect(201);
        });

        it('should clear the cookie with the attributes it was set with, or the browser keeps it', async () => {
            const attributes = (setCookie: string) =>
                setCookie
                    .split(';')
                    .slice(1)
                    .map((a) => a.trim().toLowerCase())
                    .filter((a) => !a.startsWith('expires='))
                    .sort();

            const res = await request(app.getHttpServer()).post('/auth/logout').set('Cookie', cookie).expect(201);
            const cleared = (res.headers['set-cookie'] as unknown as string[])[0];

            expect(attributes(cleared)).toEqual(attributes(cookie));
        });
    });

    describe('Per-email brute-force protection', () => {
        const bruteEmail = `brute-${Date.now()}@test.com`;

        beforeAll(async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: bruteEmail, password: 'Password123!', name: 'Brute' });
        });

        const registered: string[] = [bruteEmail];

        const register = async (prefix: string) => {
            const email = `${prefix}-${Date.now()}@test.com`;
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email, password: 'Password123!', name: prefix });
            registered.push(email);
            return email;
        };

        afterAll(async () => {
            for (const email of registered) {
                const keys = await redis.keys(`*attempts:*${email}`);
                if (keys.length) await redis.del(...keys);
            }
        });

        it('should block after 5 failed login attempts', async () => {
            for (let i = 0; i < 5; i++) {
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send({ email: bruteEmail, password: 'WrongPass123!' })
                    .expect(401);
            }

            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: bruteEmail, password: 'Password123!' })
                .expect(401);

            expect(res.body.error.message).toContain('Too many failed attempts');
        });

        it('should check only 5 of 20 parallel guesses', async () => {
            const email = await register('race');
            // One listening server for all requests: otherwise supertest opens one per request and some get reset.
            const server = app.getHttpServer();
            if (!server.listening) await new Promise<void>((resolve) => server.listen(0, resolve));

            const responses = await Promise.all(
                Array.from({ length: 20 }, () =>
                    request(server).post('/auth/login').send({ email, password: 'WrongPass123!' }),
                ),
            );

            const messages = responses.map((res) => res.body.error?.message);
            expect(messages.filter((message) => message === 'Credentials are not valid.')).toHaveLength(5);
            expect(messages.filter((message) => message?.includes('Too many failed attempts'))).toHaveLength(15);
        });

        it('should not let a successful login reset the guesses of a password reset code', async () => {
            const email = await register('reset-guess');
            const guessCode = () =>
                request(app.getHttpServer()).post('/auth/verify-password-reset-token').send({
                    email,
                    token: 123456,
                    password: 'N3wStrongP@ssword!',
                });

            for (let i = 0; i < 4; i++) {
                await guessCode().expect(401);
            }
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email, password: 'Password123!' })
                .expect(201);
            await guessCode().expect(401);

            const res = await guessCode().expect(401);
            expect(res.body.error.message).toContain('Too many failed attempts');
        });
    });
});
