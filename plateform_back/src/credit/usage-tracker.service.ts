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
    }: {
        workspaceId: string;
        agentId: string;
        query: string;
        durationMs: number;
        status: QueryLogStatus;
        creditsUsed?: number;
    }): Promise<void> {
        const shouldDebit = status === QueryLogStatus.SUCCESS;

        await this.prisma.$transaction(async (tx) => {
            if (shouldDebit) {
                const balance = await tx.creditBalance.findUnique({ where: { workspaceId } });
                if (!balance || balance.balance < creditsUsed) {
                    throw new ForbiddenException('Insufficient credits');
                }
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
