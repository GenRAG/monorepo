import { Injectable } from '@nestjs/common';
import { QueryLogStatus } from 'generated/prisma';
import {
    AgentAnalyticsRepository,
    CostBreakdownRow,
    DailyCountRow,
    DailyStatusCountRow,
    LatencyPercentileRow,
} from './agent-analytics.repository';
import {
    CostBreakdownEntry,
    DailyMetricPoint,
    DocumentHealthBreakdown,
    HeatmapDay,
    LatencyPoint,
    QueryLogPage,
} from './agent-analytics.types';

@Injectable()
export class AgentAnalyticsService {
    constructor(private readonly analyticsRepository: AgentAnalyticsRepository) {}

    async getDailyMetrics(agentId: string, days: number): Promise<DailyMetricPoint[]> {
        const since = this._startOfRange(days);
        const rows = await this.analyticsRepository.getDailyStatusCounts(agentId, since);

        return this._mergeDailyMetrics(rows, since, days);
    }

    async getLatency(agentId: string, days: number): Promise<LatencyPoint[]> {
        const since = this._startOfRange(days);
        const rows = await this.analyticsRepository.getLatencyPercentiles(agentId, since);

        return this._mergeLatencyPoints(rows, since, days);
    }

    async getActivityHeatmap(agentId: string, days: number): Promise<HeatmapDay[]> {
        const since = this._startOfRange(days);
        const rows = await this.analyticsRepository.getDailyQueryCounts(agentId, since);

        return this._mergeHeatmapDays(rows, since, days);
    }

    async getDocumentHealth(agentId: string): Promise<DocumentHealthBreakdown> {
        const counts = await this.analyticsRepository.getDocumentStatusCounts(agentId);
        const { UPLOADED, PROCESSING, INDEXED, FAILED } = counts;

        return {
            uploaded: UPLOADED,
            processing: PROCESSING,
            indexed: INDEXED,
            failed: FAILED,
            total: UPLOADED + PROCESSING + INDEXED + FAILED,
        };
    }

    getRecentQueries(agentId: string, page: number, limit: number): Promise<QueryLogPage> {
        return this.analyticsRepository.findRecentQueries(agentId, page, limit);
    }

    async getCostByModel(agentId: string, days: number): Promise<CostBreakdownEntry[]> {
        const since = this._startOfRange(days);
        const rows = await this.analyticsRepository.getCostByModel(agentId, since);

        return this._toCostBreakdownEntries(rows);
    }

    async getCostByType(agentId: string, days: number): Promise<CostBreakdownEntry[]> {
        const since = this._startOfRange(days);
        const rows = await this.analyticsRepository.getCostByType(agentId, since);

        return this._toCostBreakdownEntries(rows);
    }

    private _mergeDailyMetrics(rows: DailyStatusCountRow[], since: Date, days: number): DailyMetricPoint[] {
        const byDate = new Map<string, DailyMetricPoint>();

        for (const row of rows) {
            const date = this._toIsoDate(row.day);
            const point = byDate.get(date) ?? this._emptyDailyMetricPoint(date);

            point.queries += row.count;
            point.creditsUsed += row.credits;

            if (row.status === QueryLogStatus.ERROR) {
                point.errors += row.count;
            } else if (row.status === QueryLogStatus.OUT_OF_CREDITS) {
                point.outOfCredits += row.count;
            }
            byDate.set(date, point);
        }
        return this._buildDayRange(since, days).map((date) => byDate.get(date) ?? this._emptyDailyMetricPoint(date));
    }

    private _mergeLatencyPoints(rows: LatencyPercentileRow[], since: Date, days: number): LatencyPoint[] {
        const byDate = new Map(rows.map((row) => [this._toIsoDate(row.day), { p50: row.p50, p95: row.p95 }]));

        return this._buildDayRange(since, days).map((date) => ({ date, ...(byDate.get(date) ?? { p50: 0, p95: 0 }) }));
    }

    private _mergeHeatmapDays(rows: DailyCountRow[], since: Date, days: number): HeatmapDay[] {
        const byDate = new Map(rows.map((row) => [this._toIsoDate(row.day), row.count]));

        return this._buildDayRange(since, days).map((date) => ({ date, count: byDate.get(date) ?? 0 }));
    }

    private _toCostBreakdownEntries(rows: CostBreakdownRow[]): CostBreakdownEntry[] {
        return rows.map((row) => ({ key: row.key, costUsd: row.cost }));
    }

    private _emptyDailyMetricPoint(date: string): DailyMetricPoint {
        return { date, queries: 0, errors: 0, outOfCredits: 0, creditsUsed: 0 };
    }

    private _startOfRange(days: number): Date {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (days - 1));

        return date;
    }

    private _buildDayRange(since: Date, days: number): string[] {
        return Array.from({ length: days }, (_, offset) => {
            const date = new Date(since);
            date.setDate(date.getDate() + offset);

            return this._toIsoDate(date);
        });
    }

    private _toIsoDate(date: Date): string {
        return date.toISOString().slice(0, 10);
    }
}
