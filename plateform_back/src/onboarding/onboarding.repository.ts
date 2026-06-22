import { Injectable } from '@nestjs/common';
import { OnboardingSession, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OnboardingRepository {
    constructor(private readonly prisma: PrismaService) {}

    findByUserAndWorkspace(userId: string, workspaceId: string): Promise<OnboardingSession | null> {
        return this.prisma.onboardingSession.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } },
        });
    }

    create(data: Prisma.OnboardingSessionCreateInput): Promise<OnboardingSession> {
        return this.prisma.onboardingSession.create({ data });
    }

    update(id: string, data: Prisma.OnboardingSessionUpdateInput): Promise<OnboardingSession> {
        return this.prisma.onboardingSession.update({ where: { id }, data });
    }

    async tryIncrementQueryCount(id: string, stepId: string, max: number): Promise<boolean> {
        let limitReached = false;

        await this.prisma.$transaction(async (tx) => {
            const session = await tx.onboardingSession.findUnique({ where: { id } });
            const stepsData = (session?.stepsData as Record<string, Record<string, unknown>>) ?? {};
            const count = (stepsData[stepId]?.queryCount as number) ?? 0;

            if (count >= max) {
                limitReached = true;
                return;
            }

            await tx.onboardingSession.update({
                where: { id },
                data: {
                    stepsData: {
                        ...stepsData,
                        [stepId]: { ...(stepsData[stepId] ?? {}), queryCount: count + 1 },
                    } as Prisma.InputJsonValue,
                },
            });
        });

        return !limitReached;
    }
}
