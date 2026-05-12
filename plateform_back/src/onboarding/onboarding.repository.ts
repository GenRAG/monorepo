import { Injectable } from '@nestjs/common';
import { OnboardingSession, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OnboardingRepository {
    constructor(private readonly prisma: PrismaService) {}

    findByUserAndWorkspace(
        userId: string,
        workspaceId: string,
    ): Promise<OnboardingSession | null> {
        return this.prisma.onboardingSession.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } },
        });
    }

    create(
        data: Prisma.OnboardingSessionCreateInput,
    ): Promise<OnboardingSession> {
        return this.prisma.onboardingSession.create({ data });
    }

    update(
        id: string,
        data: Prisma.OnboardingSessionUpdateInput,
    ): Promise<OnboardingSession> {
        return this.prisma.onboardingSession.update({ where: { id }, data });
    }
}
