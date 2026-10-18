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
        it('should not change the email: an address must be proven before it opens or receives anything', async () => {
            const user = { email: 'owner@test.com', password: 'Password123!', name: 'Owner' };
            const userCookie = await registerAndLogin(app, user);

            const res = await request(app.getHttpServer())
                .patch('/users/me')
                .set('Cookie', userCookie)
                .send({ name: 'Renamed', email: 'victim@test.com' })
                .expect(200);

            expect(res.body.name).toBe('Renamed');
            expect(res.body.email).toBe('owner@test.com');
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
