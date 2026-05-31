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
    });

    describe('Per-email brute-force protection', () => {
        const bruteEmail = `brute-${Date.now()}@test.com`;

        beforeAll(async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: bruteEmail, password: 'Password123!', name: 'Brute' });
        });

        afterAll(async () => {
            await redis.del(`login:attempts:${bruteEmail}`);
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
    });
});
