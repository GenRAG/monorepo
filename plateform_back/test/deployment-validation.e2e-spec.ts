import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { createAgent, createWorkspace, registerAndLogin } from './helpers/auth.helper';

const pipeline = (topK: number) => ({
    blocks: [
        { name: 'query', type: 'query' },
        { name: 'retrieve', type: 'retrieve', top_k: topK },
        { name: 'answer', type: 'answer', model: 'google/gemini-2.5-flash' },
    ],
});

describe('Deployment validation (e2e)', () => {
    let app: INestApplication;
    let cookie: string;
    let workspaceId: string;

    beforeAll(async () => {
        app = await createTestApp();
        cookie = await registerAndLogin(app, { email: 'validator@test.com', password: 'Password123!', name: 'V' });
        workspaceId = await createWorkspace(app, cookie);
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    const agentWithWorkflow = async (topK: number) => {
        const agentId = await createAgent(app, cookie, workspaceId);
        const agentUrl = `/workspaces/${workspaceId}/agents/${agentId}`;
        await request(app.getHttpServer())
            .post(`${agentUrl}/workflow`)
            .set('Cookie', cookie)
            .send({ definition: pipeline(topK) })
            .expect(201);
        return agentUrl;
    };

    it('should refuse to deploy a pipeline the RAG engine would reject, instead of failing every end-user question', async () => {
        const agentUrl = await agentWithWorkflow(500);

        const res = await request(app.getHttpServer())
            .post(`${agentUrl}/deployments`)
            .set('Cookie', cookie)
            .send({})
            .expect(422);
        expect(res.body.error.message).toContain('top_k');

        const deployments = await request(app.getHttpServer())
            .get(`${agentUrl}/deployments`)
            .set('Cookie', cookie)
            .expect(200);
        expect(deployments.body).toHaveLength(0);
    });

    it('should deploy a valid pipeline', async () => {
        const agentUrl = await agentWithWorkflow(5);

        await request(app.getHttpServer()).post(`${agentUrl}/deployments`).set('Cookie', cookie).send({}).expect(201);
    });
});
