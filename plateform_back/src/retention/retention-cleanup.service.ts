import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Sentry from '@sentry/nestjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RetentionCleanupService {
    private readonly logger = new Logger(RetentionCleanupService.name);

    constructor(private readonly prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupExpiredConversations() {
        try {
            const agents = await this.prisma.agent.findMany({
                where: { retentionDays: { not: null } },
                select: { id: true, retentionDays: true },
            });

            if (agents.length === 0) return;

            const results = await this.prisma.$transaction(
                agents.map((agent) => {
                    const cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - agent.retentionDays!);
                    return this.prisma.conversation.deleteMany({
                        where: { agentId: agent.id, createdAt: { lt: cutoff } },
                    });
                }),
            );

            const total = results.reduce((sum, r) => sum + r.count, 0);
            if (total > 0) {
                this.logger.log(`Retention cleanup: deleted ${total} conversation(s)`);
            }
        } catch (err) {
            this.logger.error(`Retention cleanup failed: ${err instanceof Error ? err.message : String(err)}`);
            Sentry.captureException(err);
        }
    }
}
