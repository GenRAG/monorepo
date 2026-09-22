import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import type {
    DailyMetricPoint,
    LatencyPoint,
    HeatmapDay,
    DocumentHealthBreakdown,
    CostBreakdownEntry,
    QueryLogStatus,
    QueryLogEntry,
    QueryLogPage,
} from "types/analytics/analytics";

export type {
    DailyMetricPoint,
    LatencyPoint,
    HeatmapDay,
    DocumentHealthBreakdown,
    CostBreakdownEntry,
    QueryLogStatus,
    QueryLogEntry,
    QueryLogPage,
};

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
            providesTags: (_result, _error, { agentId }) => [{ type: Tag.Analytics, id: agentId }],
        }),

        getLatency: builder.query<LatencyPoint[], AnalyticsPeriodParams>({
            query: ({ days, ...params }) => ({
                url: `${analyticsBaseUrl(params)}/latency`,
                params: { days },
            }),
            providesTags: (_result, _error, { agentId }) => [{ type: Tag.Analytics, id: agentId }],
        }),

        getDocumentHealth: builder.query<DocumentHealthBreakdown, AgentRouteParams>({
            query: (params) => ({ url: `${analyticsBaseUrl(params)}/document-health` }),
            providesTags: (_result, _error, { agentId }) => [{ type: Tag.Analytics, id: agentId }],
        }),

        getActivityHeatmap: builder.query<HeatmapDay[], AgentRouteParams>({
            query: (params) => ({ url: `${analyticsBaseUrl(params)}/activity-heatmap` }),
            providesTags: (_result, _error, { agentId }) => [{ type: Tag.Analytics, id: agentId }],
        }),

        getCostByModel: builder.query<CostBreakdownEntry[], AnalyticsPeriodParams>({
            query: ({ days, ...params }) => ({
                url: `${analyticsBaseUrl(params)}/cost-by-model`,
                params: { days },
            }),
            providesTags: (_result, _error, { agentId }) => [{ type: Tag.Analytics, id: agentId }],
        }),

        getCostByType: builder.query<CostBreakdownEntry[], AnalyticsPeriodParams>({
            query: ({ days, ...params }) => ({
                url: `${analyticsBaseUrl(params)}/cost-by-type`,
                params: { days },
            }),
            providesTags: (_result, _error, { agentId }) => [{ type: Tag.Analytics, id: agentId }],
        }),

        getRecentQueries: builder.query<QueryLogPage, RecentQueriesParams>({
            query: ({ page, limit, ...params }) => ({
                url: `${analyticsBaseUrl(params)}/query-logs`,
                params: { page, limit },
            }),
            providesTags: (_result, _error, { agentId }) => [{ type: Tag.Analytics, id: agentId }],
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
