import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, it } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { createAgent, createWorkspace, registerAndLogin } from './helpers/auth.helper';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Dataset (e2e)', () => {
    let app: INestApplication;
    let cookie: string;
    let datasetsUrl: string;
    let agentId: string;
    let workspaceId: string;

    beforeAll(async () => {
        app = await createTestApp();
        cookie = await registerAndLogin(app, {
            email: 'librarian@test.com',
            password: 'Password123!',
            name: 'Librarian',
        });
        workspaceId = await createWorkspace(app, cookie);
        agentId = await createAgent(app, cookie, workspaceId);
        datasetsUrl = `/workspaces/${workspaceId}/datasets`;
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    describe('linking datasets to an agent', () => {
        it('should refuse a 51st dataset: the RAG engine searches at most 50 datasets at once', async () => {
            const server = app.getHttpServer();
            // Written directly: no plan lets a workspace create 51 datasets through the API.
            const datasets = await app.get(PrismaService).dataset.createManyAndReturn({
                data: Array.from({ length: 51 }, (_, i) => ({ workspaceId, name: `Base ${i}` })),
            });
            const ids = datasets.map((dataset) => dataset.id);
            for (const id of ids.slice(0, 50)) {
                await request(server).post(`${datasetsUrl}/${id}/agents/${agentId}`).set('Cookie', cookie).expect(204);
            }

            await request(server).post(`${datasetsUrl}/${ids[50]}/agents/${agentId}`).set('Cookie', cookie).expect(400);
            await request(server)
                .put(`${datasetsUrl}/${ids[50]}/agents`)
                .set('Cookie', cookie)
                .send({ agentIds: [agentId] })
                .expect(400);

            // Linking a dataset the agent already has is not an addition.
            await request(server).post(`${datasetsUrl}/${ids[0]}/agents/${agentId}`).set('Cookie', cookie).expect(204);
            await request(server)
                .put(`${datasetsUrl}/${ids[0]}/agents`)
                .set('Cookie', cookie)
                .send({ agentIds: [agentId] })
                .expect(204);
        });
    });
});
