import { Injectable } from '@nestjs/common';
import { DocumentStatus, QueryLogStatus } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLogPage } from './agent-analytics.types';

export interface DailyStatusCountRow {
    day: Date;
    status: QueryLogStatus;
    count: number;
    credits: number;
}

export interface LatencyPercentileRow {
    day: Date;
    p50: number;
    p95: number;
}

export interface DailyCountRow {
    day: Date;
    count: number;
}

export interface CostBreakdownRow {
    key: string;
    cost: number;
}

export type DocumentStatusCounts = Record<DocumentStatus, number>;

type CostBreakdownColumn = 'costByModel' | 'costByType';

@Injectable()
export class AgentAnalyticsRepository {
    constructor(private readonly prisma: PrismaService) {}

    getDailyStatusCounts(agentId: string, since: Date): Promise<DailyStatusCountRow[]> {
        return this.prisma.$queryRaw<DailyStatusCountRow[]>`
            SELECT DATE_TRUNC('day', "createdAt")::date AS day,
                   "status"                              AS status,
                   COUNT(*)::int                          AS count,
                   COALESCE(SUM("creditsUsed"), 0)::int   AS credits
            FROM "AgentQueryLog"
            WHERE "agentId" = ${agentId} AND "createdAt" >= ${since}
            GROUP BY day, status
            ORDER BY day ASC
        `;
    }

    getLatencyPercentiles(agentId: string, since: Date): Promise<LatencyPercentileRow[]> {
        return this.prisma.$queryRaw<LatencyPercentileRow[]>`
            SELECT DATE_TRUNC('day', "createdAt")::date                                    AS day,
                   ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY "durationMs"))::int     AS p50,
                   ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY "durationMs"))::int    AS p95
            FROM "AgentQueryLog"
            WHERE "agentId" = ${agentId}
              AND "createdAt" >= ${since}
              AND "status" = ${QueryLogStatus.SUCCESS}::"QueryLogStatus"
            GROUP BY day
            ORDER BY day ASC
        `;
    }

    getDailyQueryCounts(agentId: string, since: Date): Promise<DailyCountRow[]> {
        return this.prisma.$queryRaw<DailyCountRow[]>`
            SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::int AS count
            FROM "AgentQueryLog"
            WHERE "agentId" = ${agentId} AND "createdAt" >= ${since}
            GROUP BY day
            ORDER BY day ASC
        `;
    }

    getCostByModel(agentId: string, since: Date): Promise<CostBreakdownRow[]> {
        return this._getCostBreakdown(agentId, since, 'costByModel');
    }

    getCostByType(agentId: string, since: Date): Promise<CostBreakdownRow[]> {
        return this._getCostBreakdown(agentId, since, 'costByType');
    }

    async getDocumentStatusCounts(agentId: string): Promise<DocumentStatusCounts> {
        const rows = await this.prisma.document.groupBy({
            by: ['status'],
            where: { agentId },
            _count: true,
        });

        return this._toDocumentStatusCounts(rows);
    }

    async findRecentQueries(agentId: string, page: number, limit: number): Promise<QueryLogPage> {
        const [data, total] = await this.prisma.$transaction([
            this.prisma.agentQueryLog.findMany({
                where: { agentId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: { id: true, query: true, status: true, durationMs: true, creditsUsed: true, createdAt: true },
            }),
            this.prisma.agentQueryLog.count({ where: { agentId } }),
        ]);

        return { data, total };
    }

    /**
     * Sums a JSON cost-breakdown column (e.g. { "gpt-4o": 0.02, "mistral": 0.01 } per row) across
     * every matching query log. Done in JS rather than SQL's jsonb_each_text: the row set is
     * already bounded by the agentId+createdAt index, so unnesting a small JSON object per row
     * in JS is cheap, and it keeps this one query on the ORM like the rest of the codebase.
     */
    private async _getCostBreakdown(
        agentId: string,
        since: Date,
        column: CostBreakdownColumn,
    ): Promise<CostBreakdownRow[]> {
        const rows = await this.prisma.agentQueryLog.findMany({
            where: { agentId, createdAt: { gte: since } },
            select: { [column]: true },
        });

        const totals = new Map<string, number>();
        for (const row of rows) {
            const breakdown = row[column] as Record<string, number> | null;
            if (!breakdown) continue;

            for (const [key, value] of Object.entries(breakdown)) {
                totals.set(key, (totals.get(key) ?? 0) + value);
            }
        }

        return Array.from(totals, ([key, cost]) => ({ key, cost })).sort((a, b) => b.cost - a.cost);
    }

    private _toDocumentStatusCounts(rows: { status: DocumentStatus; _count: number }[]): DocumentStatusCounts {
        const counts: DocumentStatusCounts = {
            [DocumentStatus.UPLOADED]: 0,
            [DocumentStatus.PROCESSING]: 0,
            [DocumentStatus.INDEXED]: 0,
            [DocumentStatus.FAILED]: 0,
        };

        for (const row of rows) {
            counts[row.status] = row._count;
        }

        return counts;
    }
}
