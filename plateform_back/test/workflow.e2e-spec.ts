import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { TEST_USER, TEST_USER_2, registerAndLogin, createWorkspace, createAgent } from './helpers/auth.helper';

const WORKFLOW_DEFINITION = {
    blocks: [
        { name: 'query', type: 'query' },
        {
            name: 'retrieve',
            type: 'retrieve',
            collection_name: 'genrag_kb',
            top_k: 5,
        },
        {
            name: 'answer',
            type: 'answer',
            model: 'google/gemini-2.5-flash',
        },
    ],
};

describe('Workflow (e2e)', () => {
    let app: INestApplication;
    let cookie: string;
    let cookieUser2: string;
    let workspaceId: string;
    let agentId: string;
    let workflowUrl: string;
    let workflowV1Id: string;
    let workflowV2Id: string;

    beforeAll(async () => {
        app = await createTestApp();
        cookie = await registerAndLogin(app, TEST_USER);
        cookieUser2 = await registerAndLogin(app, TEST_USER_2);
        workspaceId = await createWorkspace(app, cookie);
        agentId = await createAgent(app, cookie, workspaceId);
        workflowUrl = `/workspaces/${workspaceId}/agents/${agentId}/workflow`;
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    describe('POST /workflow', () => {
        it('should create first workflow version (v1)', async () => {
            const res = await request(app.getHttpServer())
                .post(workflowUrl)
                .set('Cookie', cookie)
                .send({ definition: WORKFLOW_DEFINITION })
                .expect(201);

            workflowV1Id = res.body.id;
            expect(res.body.version).toBe(1);
            expect(res.body.agentId).toBe(agentId);
            expect(res.body.definition).toEqual(WORKFLOW_DEFINITION);
            expect(res.body.isActive).toBe(true);
        });

        it('should increment version on second deploy', async () => {
            const res = await request(app.getHttpServer())
                .post(workflowUrl)
                .set('Cookie', cookie)
                .send({ definition: { ...WORKFLOW_DEFINITION, v: 2 } })
                .expect(201);

            workflowV2Id = res.body.id;
            expect(res.body.version).toBe(2);
            expect(res.body.isActive).toBe(true);
        });

        it('should fail without auth', async () => {
            await request(app.getHttpServer()).post(workflowUrl).send({ definition: WORKFLOW_DEFINITION }).expect(401);
        });

        it('should fail for non-member', async () => {
            await request(app.getHttpServer())
                .post(workflowUrl)
                .set('Cookie', cookieUser2)
                .send({ definition: WORKFLOW_DEFINITION })
                .expect(403);
        });

        it('should fail without definition', async () => {
            await request(app.getHttpServer()).post(workflowUrl).set('Cookie', cookie).send({}).expect(400);
        });
    });

    describe('GET /workflow', () => {
        it('should return the latest version', async () => {
            const res = await request(app.getHttpServer()).get(workflowUrl).set('Cookie', cookie).expect(200);

            expect(res.body.version).toBe(2);
            expect(res.body.id).toBe(workflowV2Id);
        });

        it('should return a specific workflow version by number', async () => {
            const res = await request(app.getHttpServer())
                .get(`${workflowUrl}/version/1`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body.id).toBe(workflowV1Id);
            expect(res.body.version).toBe(1);
        });

        it('should return 404 if no workflow exists', async () => {
            const emptyAgentId = await createAgent(app, cookie, workspaceId, {
                name: 'Empty Agent',
                description: '',
            });

            await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${emptyAgentId}/workflow`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('should return 403 for non-member', async () => {
            await request(app.getHttpServer()).get(workflowUrl).set('Cookie', cookieUser2).expect(403);
        });
    });

    describe('GET /workflow/history', () => {
        it('should return all versions ordered by version desc', async () => {
            const res = await request(app.getHttpServer())
                .get(`${workflowUrl}/history`)
                .set('Cookie', cookie)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(workflowV2Id);
            expect(res.body[0].version).toBeGreaterThan(res.body[1].version);
        });

        it('should return empty array if no workflows', async () => {
            const emptyAgentId = await createAgent(app, cookie, workspaceId, {
                name: 'No Workflow Agent',
                description: '',
            });

            const res = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/agents/${emptyAgentId}/workflow/history`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body).toHaveLength(0);
        });
    });

    describe('PATCH /workflow', () => {
        it('should update active workflow without incrementing version', async () => {
            const beforeRes = await request(app.getHttpServer()).get(workflowUrl).set('Cookie', cookie);

            const currentVersion = beforeRes.body.version;

            const updatedDefinition = {
                blocks: [{ name: 'query', type: 'query' }],
            };

            const res = await request(app.getHttpServer())
                .patch(workflowUrl)
                .set('Cookie', cookie)
                .send({ definition: updatedDefinition })
                .expect(200);

            expect(res.body.version).toBe(currentVersion); // version inchangée
            expect(res.body.definition).toEqual(updatedDefinition);
        });

        it('should fail for non-member', async () => {
            await request(app.getHttpServer())
                .patch(workflowUrl)
                .set('Cookie', cookieUser2)
                .send({ definition: WORKFLOW_DEFINITION })
                .expect(403);
        });
    });

    describe('PATCH /workflow/activate', () => {
        it('should reactivate version 1 and return it as active', async () => {
            const res = await request(app.getHttpServer())
                .patch(`${workflowUrl}/activate`)
                .set('Cookie', cookie)
                .send({ id: workflowV1Id })
                .expect(200);

            expect(res.body.id).toBe(workflowV1Id);
            expect(res.body.version).toBe(1);
            expect(res.body.isActive).toBe(true);

            const activeRes = await request(app.getHttpServer()).get(workflowUrl).set('Cookie', cookie).expect(200);

            expect(activeRes.body.id).toBe(workflowV1Id);
        });

        it('should return 404 for unknown workflow id', async () => {
            await request(app.getHttpServer())
                .patch(`${workflowUrl}/activate`)
                .set('Cookie', cookie)
                .send({ id: 'unknown-workflow-id' })
                .expect(404);
        });

        it('should return 403 for non-member', async () => {
            await request(app.getHttpServer())
                .patch(`${workflowUrl}/activate`)
                .set('Cookie', cookieUser2)
                .send({ id: workflowV1Id })
                .expect(403);
        });
    });

    describe('GET /workflow/:id', () => {
        it('should return a specific workflow version by id', async () => {
            const historyRes = await request(app.getHttpServer()).get(`${workflowUrl}/history`).set('Cookie', cookie);

            const workflowId = historyRes.body[0].id;

            const res = await request(app.getHttpServer())
                .get(`${workflowUrl}/${workflowId}`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body.id).toBe(workflowId);
        });

        it('should return 404 for workflow from another agent', async () => {
            const otherAgentId = await createAgent(app, cookie, workspaceId, {
                name: 'Other Agent',
                description: '',
            });

            const otherWorkflowRes = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents/${otherAgentId}/workflow`)
                .set('Cookie', cookie)
                .send({ definition: WORKFLOW_DEFINITION });

            const otherWorkflowId = otherWorkflowRes.body.id;

            await request(app.getHttpServer())
                .get(`${workflowUrl}/${otherWorkflowId}`)
                .set('Cookie', cookie)
                .expect(404);
        });
    });
});
