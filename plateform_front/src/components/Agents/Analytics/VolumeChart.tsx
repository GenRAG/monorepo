import { useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import { STATUS_COLORS } from "themeNew/foundations/themeConfig";
import { Area, AreaChart, ChartStatFlow, ChartTooltip, Grid, TooltipContent, XAxis, YAxis } from "components/charts";
import { useGetDailyMetricsQuery } from "services/analytics/analytics";
import { AnalyticsChartCard } from "./AnalyticsChartCard";
import { ChartHoverBridge, type HoverState } from "components/ui/ChartHoverBridge";
import { toShortLabel } from "utils/analytics/dateUtils";
import { PERIOD_DAYS, type Period } from "./types";

interface VolumeChartProps {
    workspaceId: string;
    agentId: string;
}

export const VolumeChart = ({ workspaceId, agentId }: VolumeChartProps) => {
    const [period, setPeriod] = useState<Period>("30j");
    const [hover, setHover] = useState<HoverState>({ value: null, label: null });
    const { data: rows = [], isFetching } = useGetDailyMetricsQuery(
        { workspaceId, agentId, days: PERIOD_DAYS[period] },
        { skip: !workspaceId || !agentId },
    );
    const volumeRows = useMemo(
        () => rows.map((r) => ({ date: r.date, value: r.queries, label: toShortLabel(r.date) })),
        [rows],
    );
    const totalQueries = rows.reduce((s, r) => s + r.queries, 0);

    return (
        <AnalyticsChartCard
            title="Volume de requêtes"
            tooltip="Nombre de requêtes RAG exécutées par jour sur la période sélectionnée."
            subtitle="Vous permet de suivre l'évolution de votre activité"
            period={period}
            onPeriodChange={setPeriod}
            headerExtra={
                <Box display="flex" flexDirection="column">
                    <ChartStatFlow
                        value={hover.value ?? totalQueries}
                        label={hover.label ?? `Total sur ${PERIOD_DAYS[period]} jours`}
                        valueClassName="text-3xl font-bold"
                        labelClassName="text-xs -mt-1"
                    />
                </Box>
            }
            contentCardProps={{ px: { base: 5, md: 6 }, pt: { base: 2, md: 3 } }}
        >
            <Box h="220px" position="relative" p={0} minW={0}>
                <Box position="absolute" p={0} inset={0}>
                    <AreaChart
                        key={period}
                        status={isFetching ? "loading" : "ready"}
                        loadingLabel="Chargement..."
                        data={volumeRows}
                        margin={{ top: 8, right: 8, bottom: 40, left: 20 }}
                        aspectRatio=""
                        className="h-full"
                    >
                        <ChartHoverBridge onHoverChange={setHover} />
                        <Area
                            dataKey="value"
                            stroke={STATUS_COLORS.success}
                            fill={STATUS_COLORS.success}
                            fillOpacity={0.28}
                            strokeWidth={2}
                            showHighlight
                            loadingStroke={STATUS_COLORS.success}
                        />
                        <Grid horizontal vertical />
                        <YAxis formatValue={(value: number) => (value === 0 ? "" : String(value))} />
                        <XAxis />
                        <ChartTooltip
                            showDatePill
                            content={({ point }) => {
                                const { label, value } = point as unknown as (typeof volumeRows)[number];
                                return (
                                    <TooltipContent
                                        title={label}
                                        rows={[
                                            {
                                                color: STATUS_COLORS.success,
                                                label: "Requêtes",
                                                value,
                                            },
                                        ]}
                                    />
                                );
                            }}
                        />
                    </AreaChart>
                </Box>
            </Box>
        </AnalyticsChartCard>
    );
};
