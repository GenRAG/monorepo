import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const TEST_USER = {
    email: 'test@genrag.com',
    password: 'Password123!',
    name: 'Test User',
};

export const TEST_USER_2 = {
    email: 'test2@genrag.com',
    password: 'Password123!',
    name: 'Test User 2',
};

export async function registerAndLogin(
    app: INestApplication,
    user = TEST_USER,
): Promise<string> {
    await request(app.getHttpServer()).post('/auth/register').send(user);

    const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: user.password });

    return res.headers['set-cookie'];
}

export async function createWorkspace(
    app: INestApplication,
    cookie: string,
    data = { name: 'Test Workspace', description: 'Test description' },
): Promise<string> {
    const res = await request(app.getHttpServer())
        .post('/workspaces')
        .set('Cookie', cookie)
        .send(data);

    return res.body.id;
}

export async function createAgent(
    app: INestApplication,
    cookie: string,
    workspaceId: string,
    data = { name: 'Test Agent', description: 'Test agent' },
): Promise<string> {
    const res = await request(app.getHttpServer())
        .post(`/workspaces/${workspaceId}/agents`)
        .set('Cookie', cookie)
        .send(data);

    return res.body.id;
}
