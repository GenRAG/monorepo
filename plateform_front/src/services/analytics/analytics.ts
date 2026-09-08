import { backendApi } from "services/api";

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

export type QueryLogStatus = "SUCCESS" | "ERROR" | "OUT_OF_CREDITS";

export interface QueryLogEntry {
    id: string;
    query: string;
    status: QueryLogStatus;
    durationMs: number;
    creditsUsed: number;
    createdAt: string;
}

export interface QueryLogPage {
    data: QueryLogEntry[];
    total: number;
}

interface AgentRouteParams {
    workspaceId: string;
    agentId: string;
}

interface AnalyticsPeriodParams extends AgentRouteParams {
    days: number;
}

interface RecentQueriesParams extends AgentRouteParams {
    page: number;
    limit: number;
}

const analyticsBaseUrl = ({ workspaceId, agentId }: AgentRouteParams) =>
    `/workspaces/${workspaceId}/agents/${agentId}/analytics`;

export const analyticsApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getDailyMetrics: builder.query<DailyMetricPoint[], AnalyticsPeriodParams>({
            query: ({ days, ...params }) => ({
                url: `${analyticsBaseUrl(params)}/daily-metrics`,
                params: { days },
            }),
        }),

        getLatency: builder.query<LatencyPoint[], AnalyticsPeriodParams>({
            query: ({ days, ...params }) => ({
                url: `${analyticsBaseUrl(params)}/latency`,
                params: { days },
            }),
        }),

        getDocumentHealth: builder.query<DocumentHealthBreakdown, AgentRouteParams>({
            query: (params) => ({ url: `${analyticsBaseUrl(params)}/document-health` }),
        }),

        getActivityHeatmap: builder.query<HeatmapDay[], AgentRouteParams>({
            query: (params) => ({ url: `${analyticsBaseUrl(params)}/activity-heatmap` }),
        }),

        getCostByModel: builder.query<CostBreakdownEntry[], AnalyticsPeriodParams>({
            query: ({ days, ...params }) => ({
                url: `${analyticsBaseUrl(params)}/cost-by-model`,
                params: { days },
            }),
        }),

        getCostByType: builder.query<CostBreakdownEntry[], AnalyticsPeriodParams>({
            query: ({ days, ...params }) => ({
                url: `${analyticsBaseUrl(params)}/cost-by-type`,
                params: { days },
            }),
        }),

        getRecentQueries: builder.query<QueryLogPage, RecentQueriesParams>({
            query: ({ page, limit, ...params }) => ({
                url: `${analyticsBaseUrl(params)}/query-logs`,
                params: { page, limit },
            }),
        }),
    }),
});

export const {
    useGetDailyMetricsQuery,
    useGetLatencyQuery,
    useGetDocumentHealthQuery,
    useGetActivityHeatmapQuery,
    useGetCostByModelQuery,
    useGetCostByTypeQuery,
    useGetRecentQueriesQuery,
} = analyticsApi;
