import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { createAgent, createWorkspace, registerAndLogin } from './helpers/auth.helper';

const definition = (label: string) => ({
    blocks: [
        { name: 'query', type: 'query' },
        { name: 'retrieve', type: 'retrieve', top_k: 5 },
        { name: 'answer', type: 'answer', model: 'google/gemini-2.5-flash', system_prompt: label },
    ],
});

describe('Deployment (e2e)', () => {
    let app: INestApplication;
    let cookie: string;
    let agentUrl: string;

    beforeAll(async () => {
        app = await createTestApp();
        cookie = await registerAndLogin(app, {
            email: 'deployer@test.com',
            password: 'Password123!',
            name: 'Deployer',
        });
        const workspaceId = await createWorkspace(app, cookie);
        const agentId = await createAgent(app, cookie, workspaceId);
        agentUrl = `/workspaces/${workspaceId}/agents/${agentId}`;
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    describe('POST /deployments/rollback', () => {
        it('should put the old version back in production and keep the draft being edited', async () => {
            const server = app.getHttpServer();
            await request(server)
                .post(`${agentUrl}/workflow`)
                .set('Cookie', cookie)
                .send({ definition: definition('v1') })
                .expect(201);
            const first = await request(server)
                .post(`${agentUrl}/deployments`)
                .set('Cookie', cookie)
                .send({})
                .expect(201);
            await request(server)
                .patch(`${agentUrl}/workflow`)
                .set('Cookie', cookie)
                .send({ definition: definition('v2') })
                .expect(200);
            await request(server).post(`${agentUrl}/deployments`).set('Cookie', cookie).send({}).expect(201);
            await request(server)
                .patch(`${agentUrl}/workflow`)
                .set('Cookie', cookie)
                .send({ definition: definition('draft in progress') })
                .expect(200);

            await request(server)
                .post(`${agentUrl}/deployments/rollback`)
                .set('Cookie', cookie)
                .send({ deploymentId: first.body.id })
                .expect(201);

            const current = await request(server)
                .get(`${agentUrl}/deployments/current`)
                .set('Cookie', cookie)
                .expect(200);
            expect(current.body.latestDeployment.workflowVersion).toBe(first.body.workflowVersion);
            const draft = await request(server).get(`${agentUrl}/workflow`).set('Cookie', cookie).expect(200);
            expect(draft.body.definition).toEqual(definition('draft in progress'));
        });
    });
});
