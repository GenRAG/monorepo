import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { TEST_USER } from './helpers/auth.helper';

describe('Auth (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .send(TEST_USER)
                .expect(201);

            expect(res.body).not.toHaveProperty('password');
        });

        it('should fail if email already exists', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send(TEST_USER)
                .expect(401);
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
        it('should login and return a cookie', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: TEST_USER.email, password: TEST_USER.password })
                .expect(201);

            const cookie = res.headers['set-cookie'];
            expect(cookie).toBeDefined();
            expect(cookie[0]).toContain('Authentication');
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
});
