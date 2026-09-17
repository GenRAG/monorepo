import { useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import { STATUS_COLORS } from "themeNew/foundations/themeConfig";
import { Area, AreaChart, ChartStatFlow, ChartTooltip, Grid, TooltipContent, XAxis, YAxis } from "components/charts";
import { useGetDailyMetricsQuery } from "services/analytics/analytics";
import { AnalyticsChartCard } from "./AnalyticsChartCard";
import { ChartHoverBridge, type HoverState } from "components/ui/ChartHoverBridge";
import { toShortLabel } from "utils/analytics/dateUtils";
import { fmtCredits } from "../../../utils/analytics/costUtils";
import { PERIOD_DAYS, type Period } from "./types";

interface CostChartProps {
    workspaceId: string;
    agentId: string;
}

export const CostChart = ({ workspaceId, agentId }: CostChartProps) => {
    const [period, setPeriod] = useState<Period>("30j");
    const [hover, setHover] = useState<HoverState>({ value: null, label: null });
    const { data: rows = [], isFetching } = useGetDailyMetricsQuery(
        { workspaceId, agentId, days: PERIOD_DAYS[period] },
        { skip: !workspaceId || !agentId },
    );
    const costRows = useMemo(
        () => rows.map((r) => ({ date: r.date, value: r.creditsUsed, label: toShortLabel(r.date) })),
        [rows],
    );
    const totalCredits = useMemo(() => rows.reduce((s, r) => s + r.creditsUsed, 0), [rows]);

    return (
        <AnalyticsChartCard
            title="Consommation de crédits"
            tooltip="Crédits consommés par les appels aux modèles (génération, embedding, reranking) sur la période sélectionnée."
            subtitle="Vous permet de suivre l'évolution de votre consommation"
            period={period}
            onPeriodChange={setPeriod}
            headerExtra={
                <Box display="flex" flexDirection="column" gap={0}>
                    <ChartStatFlow
                        value={hover.value ?? totalCredits}
                        label={hover.label ?? "Total sur la période"}
                        suffix=" crédits"
                        formatOptions={{ maximumFractionDigits: 0 }}
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
                        data={costRows}
                        margin={{ top: 8, right: 8, bottom: 40, left: 30 }}
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
                                const { label, value } = point as unknown as (typeof costRows)[number];
                                return (
                                    <TooltipContent
                                        title={label}
                                        rows={[
                                            {
                                                color: STATUS_COLORS.success,
                                                label: "Crédits",
                                                value: fmtCredits(value),
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
