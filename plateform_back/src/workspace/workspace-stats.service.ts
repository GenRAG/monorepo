import { Injectable } from '@nestjs/common';
import { AgentStatus, DocumentStatus, QueryLogStatus } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspaceStatsService {
    private readonly DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    constructor(private readonly prisma: PrismaService) {}

    async getStats(workspaceId: string) {
        const now = new Date();
        const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [agents, documents, conversations, recentActivity, credit] = await Promise.all([
            this.getAgentStats(workspaceId),
            this.getDocumentStats(workspaceId),
            this.getConversationStats(workspaceId, since24h, since30d),
            this.getRecentActivity(workspaceId),
            this.prisma.creditBalance.findUnique({
                where: { workspaceId },
                select: { balance: true },
            }),
        ]);

        return {
            agents: this.formatAgents(agents),
            documents,
            conversations: { total: conversations.total, today: conversations.last24h },
            credits: credit?.balance ?? 0,
            recentActivity,
            activityChart: this.buildCharts(conversations, now),
        };
    }

    private async getAgentStats(workspaceId: string) {
        const [grouped, items] = await Promise.all([
            this.prisma.agent.groupBy({
                by: ['status'],
                where: { workspaceId },
                _count: { _all: true },
            }),
            this.prisma.agent.findMany({
                where: { workspaceId },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    _count: { select: { conversations: true, documents: true } },
                    deployments: { orderBy: { version: 'desc' }, take: 1, select: { version: true } },
                },
                orderBy: { updatedAt: 'desc' },
            }),
        ]);
        const production = grouped.find((g) => g.status === AgentStatus.PRODUCTION)?._count._all ?? 0;
        const development = grouped.find((g) => g.status === AgentStatus.DEVELOPMENT)?._count._all ?? 0;
        return { production, development, items };
    }

    private async getDocumentStats(workspaceId: string) {
        const grouped = await this.prisma.document.groupBy({
            by: ['status'],
            where: { agent: { workspaceId } },
            _count: { _all: true },
        });

        return grouped.reduce(
            (acc, row) => {
                acc.total += row._count._all;
                if (row.status === DocumentStatus.INDEXED) acc.indexed = row._count._all;
                if (row.status === DocumentStatus.PROCESSING) acc.processing = row._count._all;
                if (row.status === DocumentStatus.FAILED) acc.failed = row._count._all;
                return acc;
            },
            { indexed: 0, processing: 0, failed: 0, total: 0 },
        );
    }

    private async getConversationStats(workspaceId: string, since24h: Date, since30d: Date) {
        const [total, last24h, daily, hourly] = await this.prisma.$transaction([
            this.prisma.conversation.count({ where: { workspaceId } }),
            this.prisma.conversation.count({ where: { workspaceId, createdAt: { gte: since24h } } }),
            this.prisma.$queryRaw<{ day: Date; count: number }[]>`
                SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::int AS count
                FROM "Conversation"
                WHERE "workspaceId" = ${workspaceId} AND "createdAt" >= ${since30d}
                GROUP BY day ORDER BY day ASC
            `,
            this.prisma.$queryRaw<{ hour: Date; count: number }[]>`
                SELECT DATE_TRUNC('hour', "createdAt") AS hour, COUNT(*)::int AS count
                FROM "Conversation"
                WHERE "workspaceId" = ${workspaceId} AND "createdAt" >= ${since24h}
                GROUP BY hour ORDER BY hour ASC
            `,
        ]);
        return { total, last24h, daily, hourly };
    }

    private async getRecentActivity(workspaceId: string) {
        const [docs, deployments, conversations] = await this.prisma.$transaction([
            this.prisma.document.findMany({
                where: { agent: { workspaceId } },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { name: true, status: true, createdAt: true, agent: { select: { name: true } } },
            }),
            this.prisma.agentVersion.findMany({
                where: { agent: { workspaceId }, toStatus: AgentStatus.PRODUCTION },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { version: true, createdAt: true, agent: { select: { name: true } } },
            }),
            this.prisma.conversation.findMany({
                where: { workspaceId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { title: true, createdAt: true, agent: { select: { name: true } } },
            }),
        ]);

        return [
            ...docs.map((d) => ({
                type: 'document_upload' as const,
                title: d.name,
                subtitle: `${d.agent.name} - ${this.formatDocStatus(d.status)}`,
                createdAt: d.createdAt.toISOString(),
            })),
            ...deployments.map((d) => ({
                type: 'deployment' as const,
                title: `Promotion en production - v${d.version}`,
                subtitle: d.agent.name,
                createdAt: d.createdAt.toISOString(),
            })),
            ...conversations.map((c) => ({
                type: 'conversation' as const,
                title: c.title,
                subtitle: c.agent.name,
                createdAt: c.createdAt.toISOString(),
            })),
        ]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6);
    }

    private formatAgents(agents: Awaited<ReturnType<WorkspaceStatsService['getAgentStats']>>) {
        return {
            total: agents.production + agents.development,
            production: agents.production,
            development: agents.development,
            items: agents.items.map((a) => ({
                id: a.id,
                name: a.name,
                status: a.status as string,
                conversationCount: a._count.conversations,
                documentCount: a._count.documents,
                latestVersion: a.deployments[0]?.version ?? null,
            })),
        };
    }

    async getConsumption(workspaceId: string, days: number) {
        const now = new Date();
        const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const [agentRows, dailyRows] = await Promise.all([
            this.prisma.agentQueryLog.groupBy({
                by: ['agentId'],
                where: { status: QueryLogStatus.SUCCESS, createdAt: { gte: since }, agent: { workspaceId } },
                _sum: { creditsUsed: true },
                _count: { id: true },
            }),
            this.prisma.$queryRaw<{ day: Date; total: number }[]>`
                SELECT DATE_TRUNC('day', "createdAt")::date AS day, SUM("creditsUsed")::int AS total
                FROM "AgentQueryLog"
                WHERE "agentId" IN (SELECT id FROM "Agent" WHERE "workspaceId" = ${workspaceId})
                  AND "status" = 'SUCCESS'
                  AND "createdAt" >= ${since}
                GROUP BY day ORDER BY day ASC
            `,
        ]);

        const agentIds = agentRows.map((r) => r.agentId);
        const agents = agentIds.length
            ? await this.prisma.agent.findMany({
                  where: { id: { in: agentIds } },
                  select: { id: true, name: true },
              })
            : [];
        const nameMap = new Map(agents.map((a) => [a.id, a.name]));

        const byAgent = agentRows
            .map((r) => ({
                agentId: r.agentId,
                agentName: nameMap.get(r.agentId) ?? r.agentId,
                creditsUsed: r._sum.creditsUsed ?? 0,
                queryCount: r._count.id,
            }))
            .sort((a, b) => b.creditsUsed - a.creditsUsed);

        const dayMap = new Map(dailyRows.map((r) => [new Date(r.day).toISOString().slice(0, 10), Number(r.total)]));
        const byDay = Array.from({ length: days }, (_, i) => {
            const d = new Date(now.getTime() - (days - 1 - i) * 86400000);
            return dayMap.get(d.toISOString().slice(0, 10)) ?? 0;
        });

        const total = byAgent.reduce((s, a) => s + a.creditsUsed, 0);

        return { byAgent, byDay, total };
    }

    private formatDocStatus(status: DocumentStatus): string {
        const map: Record<DocumentStatus, string> = {
            [DocumentStatus.INDEXED]: 'Indexé',
            [DocumentStatus.FAILED]: 'Échec',
            [DocumentStatus.PROCESSING]: 'En cours',
            [DocumentStatus.UPLOADED]: 'Uploadé',
        };
        return map[status];
    }

    private buildCharts(conversations: Awaited<ReturnType<WorkspaceStatsService['getConversationStats']>>, now: Date) {
        const dayMap = new Map(
            conversations.daily.map((r) => [new Date(r.day).toISOString().slice(0, 10), Number(r.count)]),
        );
        const daily30 = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(now.getTime() - (29 - i) * 86400000);
            return dayMap.get(d.toISOString().slice(0, 10)) ?? 0;
        });

        const hourMap = new Map(conversations.hourly.map((r) => [new Date(r.hour).getHours(), Number(r.count)]));

        return {
            '24h': {
                labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
                values: Array.from({ length: 24 }, (_, i) => hourMap.get(i) ?? 0),
            },
            '7j': {
                labels: Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(now.getTime() - (6 - i) * 86400000);
                    return this.DAY_NAMES[d.getDay()];
                }),
                values: daily30.slice(-7),
            },
            '30j': {
                labels: Array.from({ length: 30 }, (_, i) => (i === 29 ? 'Auj.' : `J-${30 - i}`)),
                values: daily30,
            },
        };
    }
}
