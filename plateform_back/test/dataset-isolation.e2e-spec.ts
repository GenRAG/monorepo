import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { createAgent, createWorkspace, registerAndLogin } from './helpers/auth.helper';

// Datasets are scoped by DatasetBelongsToWorkspaceGuard alone: these routes must not reach another workspace's dataset.
describe('Dataset isolation between workspaces (e2e)', () => {
    let app: INestApplication;
    let ownerCookie: string;
    let otherCookie: string;
    let ownerWorkspaceId: string;
    let otherWorkspaceId: string;
    let otherAgentId: string;
    let datasetId: string;

    beforeAll(async () => {
        app = await createTestApp();
        ownerCookie = await registerAndLogin(app, {
            email: 'owner-ds@test.com',
            password: 'Password123!',
            name: 'Owner',
        });
        otherCookie = await registerAndLogin(app, {
            email: 'other-ds@test.com',
            password: 'Password123!',
            name: 'Other',
        });
        ownerWorkspaceId = await createWorkspace(app, ownerCookie);
        otherWorkspaceId = await createWorkspace(app, otherCookie);
        otherAgentId = await createAgent(app, otherCookie, otherWorkspaceId);
        const res = await request(app.getHttpServer())
            .post(`/workspaces/${ownerWorkspaceId}/datasets`)
            .set('Cookie', ownerCookie)
            .send({ name: 'Contrats' })
            .expect(201);
        datasetId = res.body.id;
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    it("should answer 404 on another workspace's dataset, whatever the route", async () => {
        const server = app.getHttpServer();
        const url = `/workspaces/${otherWorkspaceId}/datasets/${datasetId}`;

        await request(server).get(url).set('Cookie', otherCookie).expect(404);
        await request(server).get(`${url}/analytics`).set('Cookie', otherCookie).expect(404);
        await request(server).patch(url).set('Cookie', otherCookie).send({ name: 'Volé' }).expect(404);
        await request(server).post(`${url}/agents/${otherAgentId}`).set('Cookie', otherCookie).expect(404);
        await request(server).delete(`${url}/agents/${otherAgentId}`).set('Cookie', otherCookie).expect(404);
        await request(server)
            .put(`${url}/agents`)
            .set('Cookie', otherCookie)
            .send({ agentIds: [otherAgentId] })
            .expect(404);
        await request(server).delete(url).set('Cookie', otherCookie).expect(404);

        const kept = await request(server)
            .get(`/workspaces/${ownerWorkspaceId}/datasets/${datasetId}`)
            .set('Cookie', ownerCookie)
            .expect(200);
        expect(kept.body.name).toBe('Contrats');
        expect(kept.body.agentsCount).toBe(0);
    });
});
