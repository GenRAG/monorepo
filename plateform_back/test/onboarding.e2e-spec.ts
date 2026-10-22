import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { TEST_USER, registerAndLogin, createWorkspace } from './helpers/auth.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { PlanTier } from 'generated/prisma';

describe('Onboarding (e2e)', () => {
    let app: INestApplication;
    let cookie: string;
    let workspaceId: string;

    beforeAll(async () => {
        app = await createTestApp();
        cookie = await registerAndLogin(app, TEST_USER);
        workspaceId = await createWorkspace(app, cookie);
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    const balance = async (): Promise<number> => {
        const res = await request(app.getHttpServer())
            .get(`/workspaces/${workspaceId}/credit-balance`)
            .set('Cookie', cookie)
            .expect(200);
        return res.body.balance;
    };

    const start = (expected: number) =>
        request(app.getHttpServer())
            .post(`/workspaces/${workspaceId}/onboarding/start`)
            .set('Cookie', cookie)
            .expect(expected);

    it('gives no credits, and cannot be replayed once the demo agent is deleted', async () => {
        const before = await balance();

        const demoAgentId = (await start(201)).body.agentId;
        expect(await balance()).toBe(before);

        await request(app.getHttpServer())
            .delete(`/workspaces/${workspaceId}/agents/${demoAgentId}`)
            .set('Cookie', cookie)
            .expect(204);

        await start(409);
    });

    it('is refused to a workspace with no plan', async () => {
        await app.get(PrismaService).workspace.update({ where: { id: workspaceId }, data: { plan: PlanTier.NONE } });
        await start(403);
    });
});
