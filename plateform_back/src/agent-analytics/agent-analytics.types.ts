import { QueryLogStatus } from 'generated/prisma';

export interface DailyMetricPoint {
    date: string;
    queries: number;
    errors: number;
    outOfCredits: number;
    creditsUsed: number;
}

export interface LatencyPoint {
    date: string;
    p50: number;
    p95: number;
}

export interface HeatmapDay {
    date: string;
    count: number;
}

export interface DocumentHealthBreakdown {
    uploaded: number;
    processing: number;
    indexed: number;
    failed: number;
    total: number;
}

export interface CostBreakdownEntry {
    key: string;
    costUsd: number;
}

export interface QueryLogEntry {
    id: string;
    query: string;
    status: QueryLogStatus;
    durationMs: number;
    creditsUsed: number;
    createdAt: Date;
}

export interface QueryLogPage {
    data: QueryLogEntry[];
    total: number;
}
