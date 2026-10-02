import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';

export async function cleanDatabase(app: INestApplication): Promise<void> {
    const prisma = app.get(PrismaService);

    await prisma.creditTransaction.deleteMany();
    await prisma.creditBalance.deleteMany();
    await prisma.workflow.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.userWorkspace.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
}

/**
 * The API allows a single workspace per user: an extra one is inserted directly, to keep
 * covering the cross-workspace guards for users who belong to several workspaces.
 */
export async function seedExtraWorkspace(app: INestApplication, userEmail: string, name: string): Promise<string> {
    const prisma = app.get(PrismaService);
    const user = await prisma.user.findUniqueOrThrow({ where: { email: userEmail } });

    const workspace = await prisma.workspace.create({
        data: { name, users: { create: { userId: user.id, role: 'ADMIN' } } },
    });

    return workspace.id;
}
