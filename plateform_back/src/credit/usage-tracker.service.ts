import { ForbiddenException, Injectable } from '@nestjs/common';
import { QueryLogStatus } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreditBalanceService } from './credit-balance.service';

@Injectable()
export class UsageTrackerService {
    private static readonly COST_PER_QUERY = 1;

    constructor(
        private readonly creditService: CreditBalanceService,
        private readonly prisma: PrismaService,
    ) {}

    async recordQuery({
        workspaceId,
        agentId,
        query,
        durationMs,
        status,
        creditsUsed = UsageTrackerService.COST_PER_QUERY,
        costByModel,
        costByType,
    }: {
        workspaceId: string;
        agentId: string;
        query: string;
        durationMs: number;
        status: QueryLogStatus;
        creditsUsed?: number;
        costByModel?: Record<string, number>;
        costByType?: Record<string, number>;
    }): Promise<void> {
        const shouldDebit = status === QueryLogStatus.SUCCESS;

        await this.prisma.$transaction(async (tx) => {
            if (shouldDebit) {
                // The query already ran and its real cost is known — it must be debited even if it
                // pushes the balance below zero, otherwise the balance freezes above zero and every
                // later checkOrThrow() keeps passing, giving unlimited free queries once the balance
                // is smaller than a single query's cost.
                await tx.creditBalance.update({
                    where: { workspaceId },
                    data: { balance: { decrement: creditsUsed } },
                });
            }

            await tx.agentQueryLog.create({
                data: {
                    agentId,
                    query,
                    durationMs,
                    status,
                    creditsUsed: shouldDebit ? creditsUsed : 0,
                    costByModel,
                    costByType,
                },
            });
        });
    }

    async checkOrThrow(workspaceId: string): Promise<void> {
        const balance = await this.creditService.getBalance(workspaceId);
        if (balance <= 0) {
            throw new ForbiddenException(
                'Pas de crédits disponibles. Veuillez en acheter pour continuer à utiliser les agents.',
            );
        }
    }
}
