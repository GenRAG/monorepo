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
