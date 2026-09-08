import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WorkspaceRolesGuard } from 'src/workspace/roles/guards/workspace-roles.guard';
import { AgentBelongsToWorkspaceGuard } from 'src/agent/guard/agent-workspace.guard';
import { AgentAnalyticsService } from './agent-analytics.service';
import { AnalyticsPeriodQuery } from './dto/analytics-period.query';
import { AnalyticsPaginationQuery } from './dto/analytics-pagination.query';
import {
    CostBreakdownEntry,
    DailyMetricPoint,
    DocumentHealthBreakdown,
    HeatmapDay,
    LatencyPoint,
    QueryLogPage,
} from './agent-analytics.types';

const DEFAULT_PERIOD_DAYS = 30;
const HEATMAP_DAYS = 365;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

@Controller('workspaces/:workspaceId/agents/:agentId/analytics')
@UseGuards(JwtAuthGuard, WorkspaceRolesGuard, AgentBelongsToWorkspaceGuard)
export class AgentAnalyticsController {
    constructor(private readonly analyticsService: AgentAnalyticsService) {}

    @Get('daily-metrics')
    getDailyMetrics(
        @Param('agentId') agentId: string,
        @Query() { days }: AnalyticsPeriodQuery,
    ): Promise<DailyMetricPoint[]> {
        return this.analyticsService.getDailyMetrics(agentId, days ?? DEFAULT_PERIOD_DAYS);
    }

    @Get('latency')
    getLatency(@Param('agentId') agentId: string, @Query() { days }: AnalyticsPeriodQuery): Promise<LatencyPoint[]> {
        return this.analyticsService.getLatency(agentId, days ?? DEFAULT_PERIOD_DAYS);
    }

    @Get('document-health')
    getDocumentHealth(@Param('agentId') agentId: string): Promise<DocumentHealthBreakdown> {
        return this.analyticsService.getDocumentHealth(agentId);
    }

    @Get('activity-heatmap')
    getActivityHeatmap(@Param('agentId') agentId: string): Promise<HeatmapDay[]> {
        return this.analyticsService.getActivityHeatmap(agentId, HEATMAP_DAYS);
    }

    @Get('cost-by-model')
    getCostByModel(
        @Param('agentId') agentId: string,
        @Query() { days }: AnalyticsPeriodQuery,
    ): Promise<CostBreakdownEntry[]> {
        return this.analyticsService.getCostByModel(agentId, days ?? DEFAULT_PERIOD_DAYS);
    }

    @Get('cost-by-type')
    getCostByType(
        @Param('agentId') agentId: string,
        @Query() { days }: AnalyticsPeriodQuery,
    ): Promise<CostBreakdownEntry[]> {
        return this.analyticsService.getCostByType(agentId, days ?? DEFAULT_PERIOD_DAYS);
    }

    @Get('query-logs')
    getRecentQueries(
        @Param('agentId') agentId: string,
        @Query() { page, limit }: AnalyticsPaginationQuery,
    ): Promise<QueryLogPage> {
        return this.analyticsService.getRecentQueries(agentId, page ?? DEFAULT_PAGE, limit ?? DEFAULT_PAGE_SIZE);
    }
}
