import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { TEST_USER, registerAndLogin, createWorkspace } from './helpers/auth.helper';

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

    const start = async (): Promise<string> => {
        const res = await request(app.getHttpServer())
            .post(`/workspaces/${workspaceId}/onboarding/start`)
            .set('Cookie', cookie)
            .expect(201);
        return res.body.agentId;
    };

    it('should grant the onboarding bonus once, even after the demo agent is deleted', async () => {
        const before = await balance();

        const demoAgentId = await start();
        const afterFirstStart = await balance();
        expect(afterFirstStart).toBe(before + 20);

        await request(app.getHttpServer())
            .delete(`/workspaces/${workspaceId}/agents/${demoAgentId}`)
            .set('Cookie', cookie)
            .expect(204);

        await start();
        expect(await balance()).toBe(afterFirstStart);
    });
});
