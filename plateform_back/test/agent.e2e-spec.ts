import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { TEST_USER, TEST_USER_2, registerAndLogin, createWorkspace } from './helpers/auth.helper';

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
            expect(res.body.description).toBe('AI support');
            expect(res.body.status).toBe('DEVELOPMENT');
            expect(res.body.workspaceId).toBe(workspaceId);
            expect(res.body.createdBy).toBeDefined();
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

        it('should create agent with long description', async () => {
            const longDesc = 'A'.repeat(500);
            const res = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'Agent with long desc', description: longDesc })
                .expect(201);

            expect(res.body.description).toBe(longDesc);
        });

        it('should trim whitespace from name', async () => {
            const res = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: '  Trimmed Agent  ', description: 'Test trim' })
                .expect(201);

            expect(res.body.name).toBe('Trimmed Agent');
        });

        it('should create agent without description', async () => {
            const res = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'Agent without desc' })
                .expect(201);

            expect(res.body.name).toBe('Agent without desc');
            expect(res.body.description).toBeNull();
        });

        it('should allow special characters in name', async () => {
            const res = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'Agent-2024_v1.0 (Beta)' })
                .expect(201);

            expect(res.body.name).toBe('Agent-2024_v1.0 (Beta)');
        });
    });

    describe('GET /workspaces/:workspaceId/agents', () => {
        let agent1Id: string;
        let agent2Id: string;

        beforeAll(async () => {
            const res1 = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'List Test Agent 1', description: 'First' })
                .expect(201);
            agent1Id = res1.body.id;

            const res2 = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'List Test Agent 2', description: 'Second' })
                .expect(201);
            agent2Id = res2.body.id;
        });

        it('should return all agents in workspace', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(2);

            const foundAgent1 = res.body.find((a: any) => a.id === agent1Id);
            const foundAgent2 = res.body.find((a: any) => a.id === agent2Id);
            expect(foundAgent1).toBeDefined();
            expect(foundAgent2).toBeDefined();
        });

        it('should return agents with all required fields', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .expect(200);

            const agent = res.body[0];
            expect(agent.id).toBeDefined();
            expect(agent.name).toBeDefined();
            expect(agent.status).toBe('DEVELOPMENT');
            expect(agent.workspaceId).toBe(workspaceId);
            expect(agent.createdAt).toBeDefined();
        });

        it('should return empty array if no agents', async () => {
            const emptyWorkspaceId = await createWorkspace(app, cookie, {
                name: 'Empty Workspace',
                description: '',
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

        it('should return 401 without auth', async () => {
            await request(app.getHttpServer()).get(`/workspaces/${workspaceId}/agents`).expect(401);
        });
    });

    describe('GET /workspaces/:workspaceId/agents/:id', () => {
        it('should return a specific agent', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentId}`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body.id).toBe(agentId);
            expect(res.body.name).toBe('Support Agent');
            expect(res.body.status).toBe('DEVELOPMENT');
        });

        it('should return agent with all fields', async () => {
            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentId}`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('description');
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('workspaceId');
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');
        });

        it('should return 404 for unknown agent id', async () => {
            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/nonexistent-id-12345`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('should return 404 when agent belongs to different workspace', async () => {
            const otherWorkspaceId = await createWorkspace(app, cookie, {
                name: 'Other Workspace',
                description: '',
            });

            await request(app.getHttpServer())
                .get(`/workspaces/${otherWorkspaceId}/agents/${agentId}`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('should return 403 for non-member', async () => {
            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentId}`)
                .set('Cookie', cookieUser2)
                .expect(403);
        });

        it('should return 401 without auth', async () => {
            await request(app.getHttpServer()).get(`/workspaces/${workspaceId}/agents/${agentId}`).expect(401);
        });
    });

    describe('PATCH /workspaces/:workspaceId/agents/:id', () => {
        let updateTestAgentId: string;

        beforeAll(async () => {
            const res = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'Agent for update test', description: 'Original' })
                .expect(201);
            updateTestAgentId = res.body.id;
        });

        it('should update agent name', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}/agents/${updateTestAgentId}`)
                .set('Cookie', cookie)
                .send({ name: 'Updated Agent Name' })
                .expect(200);

            expect(res.body.name).toBe('Updated Agent Name');
        });

        it('should update agent description', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}/agents/${updateTestAgentId}`)
                .set('Cookie', cookie)
                .send({ description: 'New description' })
                .expect(200);

            expect(res.body.description).toBe('New description');
        });

        it('should update both name and description', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}/agents/${updateTestAgentId}`)
                .set('Cookie', cookie)
                .send({ name: 'Final Name', description: 'Final Description' })
                .expect(200);

            expect(res.body.name).toBe('Final Name');
            expect(res.body.description).toBe('Final Description');
        });

        it('should preserve immutable fields', async () => {
            const res = await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}/agents/${updateTestAgentId}`)
                .set('Cookie', cookie)
                .send({ name: 'Changed Name' })
                .expect(200);

            expect(res.body.id).toBe(updateTestAgentId);
            expect(res.body.workspaceId).toBe(workspaceId);
            expect(res.body.status).toBe('DEVELOPMENT');
        });

        it('should fail for non-member', async () => {
            await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}/agents/${updateTestAgentId}`)
                .set('Cookie', cookieUser2)
                .send({ name: 'Hack' })
                .expect(403);
        });

        it('should return 404 for nonexistent agent', async () => {
            await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}/agents/nonexistent`)
                .set('Cookie', cookie)
                .send({ name: 'Updated' })
                .expect(404);
        });

        it('should return 401 without auth', async () => {
            await request(app.getHttpServer())
                .patch(`/workspaces/${workspaceId}/agents/${updateTestAgentId}`)
                .send({ name: 'Unauthorized' })
                .expect(401);
        });
    });

    describe('DELETE /workspaces/:workspaceId/agents/:id', () => {
        it('should delete agent and cascade workflows', async () => {
            const agentRes = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'To Delete Agent' })
                .expect(201);

            const tempAgentId = agentRes.body.id;

            // Create a workflow first
            await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents/${tempAgentId}/workflow`)
                .set('Cookie', cookie)
                .send({ definition: { blocks: [{ name: 'query', type: 'query' }] } })
                .expect(201);

            // Delete the agent
            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${tempAgentId}`)
                .set('Cookie', cookie)
                .expect(200);

            // Verify agent is gone
            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${tempAgentId}`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('should return deleted agent data', async () => {
            const agentRes = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'Delete Response Test', description: 'Check response' })
                .expect(201);

            const deleteRes = await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${agentRes.body.id}`)
                .set('Cookie', cookie)
                .expect(200);

            expect(deleteRes.body.id).toBe(agentRes.body.id);
            expect(deleteRes.body.name).toBe('Delete Response Test');
        });

        it('should return 404 for nonexistent agent', async () => {
            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/nonexistent`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('should fail for non-member', async () => {
            const agentRes = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'Agent for permission test' })
                .expect(201);

            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${agentRes.body.id}`)
                .set('Cookie', cookieUser2)
                .expect(403);

            // Verify agent still exists
            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentRes.body.id}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('should return 401 without auth', async () => {
            const agentRes = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'No auth test' })
                .expect(201);

            await request(app.getHttpServer())
                .delete(`/workspaces/${workspaceId}/agents/${agentRes.body.id}`)
                .expect(401);
        });

        it('should prevent deletion of agent in another workspace', async () => {
            const otherWorkspaceId = await createWorkspace(app, cookie, {
                name: 'Other workspace for delete test',
                description: '',
            });

            // Try to delete using wrong workspace ID
            await request(app.getHttpServer())
                .delete(`/workspaces/${otherWorkspaceId}/agents/${agentId}`)
                .set('Cookie', cookie)
                .expect(404);

            // Verify agent still exists in original workspace
            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${agentId}`)
                .set('Cookie', cookie)
                .expect(200);
        });
    });
});
