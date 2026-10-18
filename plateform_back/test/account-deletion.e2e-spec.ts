import { INestApplication } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Queue } from 'bullmq';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { createWorkspace, registerAndLogin } from './helpers/auth.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { DATASET_CLEANUP_QUEUE } from '../src/dataset/dataset.service';

describe('Account deletion (e2e)', () => {
    let app: INestApplication;
    let queue: Queue;

    beforeAll(async () => {
        app = await createTestApp();
        queue = app.get<Queue>(getQueueToken(DATASET_CLEANUP_QUEUE));
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
    });

    it("should queue the removal of the workspace's vectors and stored files: deleting the rows leaves them behind", async () => {
        const cookie = await registerAndLogin(app, {
            email: 'leaving@test.com',
            password: 'Password123!',
            name: 'Leaving',
        });
        const workspaceId = await createWorkspace(app, cookie);
        const dataset = await request(app.getHttpServer())
            .post(`/workspaces/${workspaceId}/datasets`)
            .set('Cookie', cookie)
            .send({ name: 'RH' })
            .expect(201);
        const storageKey = `datasets/${dataset.body.id}/1-contrat.pdf`;
        await app.get(PrismaService).document.create({
            data: {
                datasetId: dataset.body.id,
                name: 'contrat.pdf',
                size: 10,
                storageKey,
                mimeType: 'application/pdf',
            },
        });

        await request(app.getHttpServer()).delete('/users/me').set('Cookie', cookie).expect(204);

        const jobs = await queue.getJobs(['delayed', 'waiting', 'active', 'completed', 'failed']);
        const cleanup = jobs.find((job) => job.data?.workspaceId === workspaceId && !job.data?.datasetId);
        expect(cleanup?.data).toEqual({ workspaceId, storageKeys: [storageKey] });
        await Promise.all(jobs.map((job) => job.remove()));
    });

    it('should leave a workspace shared with another member untouched', async () => {
        const prisma = app.get(PrismaService);
        const cookie = await registerAndLogin(app, { email: 'partner@test.com', password: 'Password123!', name: 'P' });
        const workspaceId = await createWorkspace(app, cookie);
        const colleague = await prisma.user.create({ data: { email: 'colleague@test.com', name: 'C' } });
        await prisma.userWorkspace.create({ data: { userId: colleague.id, workspaceId } });

        await request(app.getHttpServer()).delete('/users/me').set('Cookie', cookie).expect(204);

        const jobs = await queue.getJobs(['delayed', 'waiting', 'active', 'completed', 'failed']);
        expect(jobs.filter((job) => job.data?.workspaceId === workspaceId)).toHaveLength(0);
        expect(await prisma.workspace.findUnique({ where: { id: workspaceId } })).not.toBeNull();
        await Promise.all(jobs.map((job) => job.remove()));
    });
});
