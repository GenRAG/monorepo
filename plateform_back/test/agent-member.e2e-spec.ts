import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { TEST_USER, TEST_USER_2, registerAndLogin, createWorkspace, createAgent } from './helpers/auth.helper';

describe('AgentMember (e2e)', () => {
    let app: INestApplication;
    let cookie: string;
    let cookieUser2: string;
    let workspaceId: string;
    let agentId: string;
    let memberId: string;

    beforeAll(async () => {
        app = await createTestApp();
        cookie = await registerAndLogin(app, TEST_USER);
        cookieUser2 = await registerAndLogin(app, TEST_USER_2);
        workspaceId = await createWorkspace(app, cookie);
        agentId = await createAgent(app, cookie, workspaceId, {
            name: 'Support Agent',
            description: 'Agent used for member tests',
        });
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    describe('GET /workspaces/:workspaceId/agents/:agentId/members', () => {
        it('should return an empty list before any member is added', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentId}/members`)
                .set('Cookie', cookie)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(0);
        });

        it('should return 401 without auth', async () => {
            await request(app.getHttpServer()).get(`/workspaces/${workspaceId}/agents/${agentId}/members`).expect(401);
        });

        it('should return 403 for a non-workspace member', async () => {
            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentId}/members`)
                .set('Cookie', cookieUser2)
                .expect(403);
        });
    });

    describe('POST /workspaces/:workspaceId/agents/:agentId/members', () => {
        it('should add a member by email', async () => {
            const res = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents/${agentId}/members`)
                .set('Cookie', cookie)
                .send({ email: TEST_USER_2.email })
                .expect(201);

            memberId = res.body.id;

            expect(res.body.userId).toBeDefined();
            expect(res.body.email).toBe(TEST_USER_2.email);
            expect(res.body.name).toBe(TEST_USER_2.name);
            expect(res.body.createdAt).toBeDefined();
        });

        it('should refuse a duplicate member', async () => {
            await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents/${agentId}/members`)
                .set('Cookie', cookie)
                .send({ email: TEST_USER_2.email })
                .expect(409);
        });

        it('should fail for an unknown email', async () => {
            await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents/${agentId}/members`)
                .set('Cookie', cookie)
                .send({ email: 'missing-user@test.com' })
                .expect(404);
        });

        it('should return 403 for a non-workspace member', async () => {
            await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents/${agentId}/members`)
                .set('Cookie', cookieUser2)
                .send({ email: TEST_USER.email })
                .expect(403);
        });

        it('should return 401 without auth', async () => {
            await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents/${agentId}/members`)
                .send({ email: TEST_USER.email })
                .expect(401);
        });
    });

    describe('GET /workspaces/:workspaceId/agents/:agentId/members after adding', () => {
        it('should return the added member', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentId}/members`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(memberId);
            expect(res.body[0].email).toBe(TEST_USER_2.email);
            expect(res.body[0].name).toBe(TEST_USER_2.name);
        });
    });

    describe('DELETE /workspaces/:workspaceId/agents/:agentId/members/:memberId', () => {
        it('should remove the member', async () => {
            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${agentId}/members/${memberId}`)
                .set('Cookie', cookie)
                .expect(204);

            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentId}/members`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body).toHaveLength(0);
        });

        it('should return 404 when removing an unknown member', async () => {
            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${agentId}/members/unknown-member-id`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('should return 403 for a non-workspace member', async () => {
            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${agentId}/members/${memberId}`)
                .set('Cookie', cookieUser2)
                .expect(403);
        });

        it('should return 401 without auth', async () => {
            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${agentId}/members/${memberId}`)
                .expect(401);
        });
    });
});
