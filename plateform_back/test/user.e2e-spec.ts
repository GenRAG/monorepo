import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { TEST_USER, registerAndLogin } from './helpers/auth.helper';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Users (e2e)', () => {
    let app: INestApplication;
    let cookie: string;

    beforeAll(async () => {
        app = await createTestApp();
        cookie = await registerAndLogin(app);
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    describe('GET /users/me', () => {
        it('should return current user without password', async () => {
            const res = await request(app.getHttpServer()).get('/users/me').set('Cookie', cookie).expect(200);

            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('email', TEST_USER.email);
            expect(res.body).not.toHaveProperty('password');
            expect(res.body).not.toHaveProperty('emailVerificationToken');
            expect(res.body).not.toHaveProperty('passwordResetToken');
        });

        it('should return 401 without auth', async () => {
            await request(app.getHttpServer()).get('/users/me').expect(401);
        });
    });

    describe('DELETE /users/me', () => {
        it('should delete current user and return 204', async () => {
            const tempUser = {
                email: 'todelete@test.com',
                password: 'Password123!',
                name: 'Temp User',
            };

            const tempCookie = await registerAndLogin(app, tempUser);

            await request(app.getHttpServer()).delete('/users/me').set('Cookie', tempCookie).expect(204);

            await request(app.getHttpServer()).get('/users/me').set('Cookie', tempCookie).expect(401);
        });

        it('should return 401 without auth', async () => {
            await request(app.getHttpServer()).delete('/users/me').expect(401);
        });
    });
});
