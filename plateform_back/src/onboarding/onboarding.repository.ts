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

    /**
     * Atomic: the limit check and the increment are one UPDATE, so parallel requests cannot all pass it.
     * Returns false when the limit was already reached.
     */
    async tryIncrementQueryCount(id: string, stepId: string, max: number): Promise<boolean> {
        const updated = await this.prisma.$executeRaw`
            UPDATE "OnboardingSession"
            SET "stepsData" = jsonb_set(
                COALESCE("stepsData", '{}'::jsonb),
                ARRAY[${stepId}::text],
                COALESCE("stepsData" -> ${stepId}, '{}'::jsonb)
                    || jsonb_build_object('queryCount', COALESCE(("stepsData" -> ${stepId} ->> 'queryCount')::int, 0) + 1)
            )
            WHERE "id" = ${id}
              AND COALESCE(("stepsData" -> ${stepId} ->> 'queryCount')::int, 0) < ${max}
        `;
        return updated > 0;
    }

    /** Atomic merge into one step: concurrent writes cannot overwrite each other's keys (e.g. `queryCount`). */
    async mergeStepData(id: string, stepId: string, data: Record<string, unknown>): Promise<void> {
        await this.prisma.$executeRaw`
            UPDATE "OnboardingSession"
            SET "stepsData" = jsonb_set(
                COALESCE("stepsData", '{}'::jsonb),
                ARRAY[${stepId}::text],
                COALESCE("stepsData" -> ${stepId}, '{}'::jsonb) || ${JSON.stringify(data)}::jsonb
            )
            WHERE "id" = ${id}
        `;
    }
}
