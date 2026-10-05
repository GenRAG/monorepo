import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { TEST_USER, TEST_USER_2, registerAndLogin } from './helpers/auth.helper';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Workspace (e2e)', () => {
    let app: INestApplication;
    let cookie: string;
    let cookieUser2: string;
    let workspaceId: string;

    beforeAll(async () => {
        app = await createTestApp();
        cookie = await registerAndLogin(app, TEST_USER);
        cookieUser2 = await registerAndLogin(app, TEST_USER_2);
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    describe('POST /workspaces', () => {
        it('should create a workspace and assign creator as ADMIN', async () => {
            const res = await request(app.getHttpServer())
                .post('/workspaces')
                .set('Cookie', cookie)
                .send({ name: 'Mon Workspace', description: 'Test' })
                .expect(201);

            workspaceId = res.body.id;

            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe('Mon Workspace');
            expect(res.body.users[0].role).toBe('ADMIN');
        });

        it('should fail without auth', async () => {
            await request(app.getHttpServer())
                .post('/workspaces')
                .send({ name: 'Test', description: 'Test' })
                .expect(401);
        });

        it('should fail with missing fields', async () => {
            await request(app.getHttpServer()).post('/workspaces').set('Cookie', cookieUser2).send({}).expect(400);
        });

        it('should refuse a second workspace for the same user', async () => {
            await request(app.getHttpServer())
                .post('/workspaces')
                .set('Cookie', cookie)
                .send({ name: 'Second' })
                .expect(409);
        });
    });

    describe('DELETE /workspaces/:id', () => {
        it('should not be exposed: deleting then recreating would grant the initial credits again', async () => {
            await request(app.getHttpServer()).delete(`/workspaces/${workspaceId}`).set('Cookie', cookie).expect(404);
            await request(app.getHttpServer()).get(`/workspaces/${workspaceId}`).set('Cookie', cookie).expect(200);
        });
    });

    describe('PATCH /workspaces/:id', () => {
        it('should rename the workspace as ADMIN', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}`)
                .set('Cookie', cookie)
                .send({ name: 'Acme' })
                .expect(200);

            expect(res.body.name).toBe('Acme');
        });

        it('should fail with an empty name', async () => {
            await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}`)
                .set('Cookie', cookie)
                .send({ name: '' })
                .expect(400);
        });

        it('should return 403 for non-member', async () => {
            await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}`)
                .set('Cookie', cookieUser2)
                .send({ name: 'Hack' })
                .expect(403);
        });
    });

    describe('GET /workspaces', () => {
        it('should return only workspaces of current user', async () => {
            const res = await request(app.getHttpServer()).get('/workspaces').set('Cookie', cookie).expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].id).toBe(workspaceId);
        });

        it('should not return workspaces of another user', async () => {
            const res = await request(app.getHttpServer()).get('/workspaces').set('Cookie', cookieUser2).expect(200);

            expect(res.body).toHaveLength(0);
        });

        it('should fail without auth', async () => {
            await request(app.getHttpServer()).get('/workspaces').expect(401);
        });
    });

    describe('GET /workspaces/:id', () => {
        it('should return workspace by id for member', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body.id).toBe(workspaceId);
        });

        it('should return 403 for non-member', async () => {
            await request(app.getHttpServer()).get(`/workspaces/${workspaceId}`).set('Cookie', cookieUser2).expect(403);
        });

        it('should return 404 for unknown workspace', async () => {
            await request(app.getHttpServer()).get('/workspaces/unknown-id').set('Cookie', cookie).expect(404);
        });
    });

    describe('GET /workspaces/:id/stats', () => {
        it('should return stats for member', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/stats`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body).toHaveProperty('agents');
            expect(res.body).toHaveProperty('documents');
            expect(res.body).toHaveProperty('conversations');
            expect(res.body).toHaveProperty('credits');
            expect(res.body).toHaveProperty('recentActivity');
            expect(res.body).toHaveProperty('activityChart');
        });

        it('should return 403 for non-member', async () => {
            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/stats`)
                .set('Cookie', cookieUser2)
                .expect(403);
        });

        it('should return 404 for unknown workspace', async () => {
            await request(app.getHttpServer()).get('/workspaces/unknown-id/stats').set('Cookie', cookie).expect(404);
        });
    });
});
