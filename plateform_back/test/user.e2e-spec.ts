import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { PrismaService } from '../src/prisma/prisma.service';
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
            expect(res.body).toHaveProperty('hasPassword', true);
            expect(res.body).toHaveProperty('isEmailVerified');
        });

        it('should return 401 without auth', async () => {
            await request(app.getHttpServer()).get('/users/me').expect(401);
        });
    });

    describe('account without password (created with Google)', () => {
        let googleCookie: string;

        beforeAll(async () => {
            googleCookie = await registerAndLogin(app, {
                email: 'google@test.com',
                password: 'Password123!',
                name: 'Google',
            });
            // Same state as createGoogleUser, without going through Google.
            await app.get(PrismaService).user.update({
                where: { email: 'google@test.com' },
                data: { password: null, isEmailVerified: true },
            });
        });

        it('should tell GET /users/me it has no password', async () => {
            const res = await request(app.getHttpServer()).get('/users/me').set('Cookie', googleCookie).expect(200);

            expect(res.body).toMatchObject({ hasPassword: false, isEmailVerified: true });
        });

        it('should answer 400 on PATCH /users/me/password instead of a wrong-password 401', async () => {
            const res = await request(app.getHttpServer())
                .patch('/users/me/password')
                .set('Cookie', googleCookie)
                .send({ currentPassword: 'anything', newPassword: 'NewPassword123!' })
                .expect(400);

            expect(JSON.stringify(res.body)).toContain('Mot de passe oublié');
        });
    });

    describe('PATCH /users/me', () => {
        it('should normalize a changed email so the user can still log in with it', async () => {
            const user = { email: 'casechange@test.com', password: 'Password123!', name: 'Case' };
            const userCookie = await registerAndLogin(app, user);

            const res = await request(app.getHttpServer())
                .patch('/users/me')
                .set('Cookie', userCookie)
                .send({ email: 'CaseChanged@Test.com' })
                .expect(200);
            expect(res.body.email).toBe('casechanged@test.com');

            await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'CaseChanged@Test.com', password: user.password })
                .expect(201);
        });

        it('should return 409 when the email is already used by another account', async () => {
            await request(app.getHttpServer())
                .patch('/users/me')
                .set('Cookie', cookie)
                .send({ email: 'casechanged@test.com' })
                .expect(409);
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
