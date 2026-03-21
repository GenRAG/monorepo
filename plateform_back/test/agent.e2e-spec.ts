import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import {
    TEST_USER,
    TEST_USER_2,
    registerAndLogin,
    createWorkspace,
} from './helpers/auth.helper';

describe('Agent (e2e)', () => {
    let app: INestApplication;
    let cookie: string;
    let cookieUser2: string;
    let workspaceId: string;
    let agentId: string;

    beforeAll(async () => {
        app = await createTestApp();
        cookie = await registerAndLogin(app, TEST_USER);
        cookieUser2 = await registerAndLogin(app, TEST_USER_2);
        workspaceId = await createWorkspace(app, cookie);
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    describe('POST /workspaces/:workspaceId/agents', () => {
        it('should create an agent with DEVELOPMENT status', async () => {
            const res = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'Support Agent', description: 'AI support' })
                .expect(201);

            agentId = res.body.id;

            expect(res.body.name).toBe('Support Agent');
            expect(res.body.status).toBe('DEVELOPMENT');
            expect(res.body.workspaceId).toBe(workspaceId);
        });

        it('should fail without auth', async () => {
            await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .send({ name: 'Agent' })
                .expect(401);
        });

        it('should fail for non-member', async () => {
            await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookieUser2)
                .send({ name: 'Agent' })
                .expect(403);
        });

        it('should fail with missing name', async () => {
            await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ description: 'No name' })
                .expect(400);
        });
    });

    describe('GET /workspaces/:workspaceId/agents', () => {
        it('should return all agents in workspace', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should return empty array if no agents', async () => {
            const emptyWorkspaceId = await createWorkspace(app, cookie, {
                name: 'Empty Workspace',
                description: 'No agents',
            });

            const res = await request(app.getHttpServer())
                .get(`/workspaces/${emptyWorkspaceId}/agents`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body).toHaveLength(0);
        });

        it('should return 403 for non-member', async () => {
            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookieUser2)
                .expect(403);
        });
    });

    describe('GET /workspaces/:workspaceId/agents/:id', () => {
        it('should return a specific agent', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentId}`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body.id).toBe(agentId);
        });

        it('should return 404 for unknown agent id', async () => {
            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/unknown-id`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('should return 404 when agent belongs to different workspace', async () => {
            const otherWorkspaceId = await createWorkspace(app, cookie, {
                name: 'Other Workspace',
                description: 'Other',
            });

            await request(app.getHttpServer())
                .get(`/workspaces/${otherWorkspaceId}/agents/${agentId}`)
                .set('Cookie', cookie)
                .expect(404);
        });
    });

    describe('PATCH /workspaces/:workspaceId/agents/:id', () => {
        it('should update agent name', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}/agents/${agentId}`)
                .set('Cookie', cookie)
                .send({ name: 'Updated Agent' })
                .expect(200);

            expect(res.body.name).toBe('Updated Agent');
        });

        it('should fail for non-member', async () => {
            await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}/agents/${agentId}`)
                .set('Cookie', cookieUser2)
                .send({ name: 'Hack' })
                .expect(403);
        });
    });

    describe('DELETE /workspaces/:workspaceId/agents/:id', () => {
        it('should delete agent and cascade workflows', async () => {
            const agentRes = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'To Delete Agent' });

            const tempAgentId = agentRes.body.id;

            await request(app.getHttpServer())
                .post(
                    `/workspaces/${workspaceId}/agents/${tempAgentId}/workflow`,
                )
                .set('Cookie', cookie)
                .send({
                    definition: { blocks: [{ name: 'query', type: 'query' }] },
                });

            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${tempAgentId}`)
                .set('Cookie', cookie)
                .expect(200);

            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${tempAgentId}`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('should fail for non-member', async () => {
            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${agentId}`)
                .set('Cookie', cookieUser2)
                .expect(403);
        });
    });
});
