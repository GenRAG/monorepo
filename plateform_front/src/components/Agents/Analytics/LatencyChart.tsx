import { useMemo, useState } from "react";
import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { CHART_GREEN_SHADES, STATUS_COLORS } from "themeNew/foundations/themeConfig";
import { ChartStatFlow, ChartTooltip, Grid, Line, LineChart, TooltipContent, XAxis, YAxis } from "components/charts";
import { useGetLatencyQuery } from "services/analytics/analytics";
import { AnalyticsChartCard } from "./AnalyticsChartCard";
import { LatencyHoverBridge, type LatencyHoverState } from "components/ui/ChartHoverBridge";
import { toShortLabel } from "utils/analytics/dateUtils";
import { PERIOD_DAYS, type Period } from "./types";

const P50_COLOR = STATUS_COLORS.success;
const P95_COLOR = CHART_GREEN_SHADES[0];

interface LatencyChartProps {
    workspaceId: string;
    agentId: string;
}

export const LatencyChart = ({ workspaceId, agentId }: LatencyChartProps) => {
    const [period, setPeriod] = useState<Period>("30j");
    const [hover, setHover] = useState<LatencyHoverState>({ p50: null, p95: null, label: null });
    const { data: rows = [], isFetching } = useGetLatencyQuery(
        { workspaceId, agentId, days: PERIOD_DAYS[period] },
        { skip: !workspaceId || !agentId },
    );
    const latencyRows = useMemo(
        () => rows.map((r) => ({ date: r.date, p50: r.p50, p95: r.p95, label: toShortLabel(r.date) })),
        [rows],
    );
    const rowsWithData = useMemo(() => rows.filter((r) => r.p50 > 0 || r.p95 > 0), [rows]);
    const avgLatency = rowsWithData.length
        ? Math.round(rowsWithData.reduce((s, r) => s + r.p50, 0) / rowsWithData.length)
        : 0;
    const avgP95 = rowsWithData.length
        ? Math.round(rowsWithData.reduce((s, r) => s + r.p95, 0) / rowsWithData.length)
        : 0;

    return (
        <AnalyticsChartCard
            title="Latence de réponse"
            tooltip="Temps de réponse médian (p50) et 95e percentile (p95) des requêtes, en millisecondes."
            subtitle="Vous permet de suivre l'évolution du temps de réponse"
            period={period}
            onPeriodChange={setPeriod}
            headerExtra={
                <Box display="flex" justifyContent="space-between" gap={0}>
                    <HStack spacing={6}>
                        <Stack spacing={0}>
                            <ChartStatFlow
                                value={hover.p50 ?? avgLatency}
                                label={hover.label ?? "p50 moyen"}
                                valueClassName="text-3xl font-bold"
                                labelClassName="text-xs -mt-1"
                            />
                        </Stack>
                        <Stack spacing={0}>
                            <ChartStatFlow
                                value={hover.p95 ?? avgP95}
                                label={hover.label ?? "p95 moyen"}
                                valueClassName="text-3xl font-bold"
                                labelClassName="text-xs -mt-1"
                            />
                        </Stack>
                    </HStack>
                    <HStack spacing={4} alignItems="end">
                        <HStack spacing={1.5}>
                            <Box w={2} h={2} borderRadius="full" bg={P50_COLOR} />
                            <Text fontSize="xs" color="textLabel">
                                p50 médiane
                            </Text>
                        </HStack>
                        <HStack spacing={1.5}>
                            <Box w={2} h={2} borderRadius="full" bg={P95_COLOR} />
                            <Text fontSize="xs" color="textLabel">
                                p95
                            </Text>
                        </HStack>
                    </HStack>
                </Box>
            }
            contentCardProps={{ px: { base: 5, md: 6 }, pt: { base: 2, md: 3 } }}
        >
            <Box h="220px" position="relative" p={0} minW={0}>
                <Box position="absolute" p={0} inset={0}>
                    <LineChart
                        key={period}
                        status={isFetching ? "loading" : "ready"}
                        data={latencyRows}
                        margin={{ top: 8, right: 8, bottom: 40, left: 25 }}
                        aspectRatio=""
                        className="h-full"
                    >
                        <Line
                            dataKey="p95"
                            stroke={P95_COLOR}
                            strokeWidth={2}
                            showHighlight
                            loadingStroke={P95_COLOR}
                            fadeEdges={false}
                        />
                        <Line
                            dataKey="p50"
                            stroke={P50_COLOR}
                            strokeWidth={2.5}
                            showHighlight
                            loadingStroke={P50_COLOR}
                            fadeEdges={false}
                        />
                        <Grid horizontal vertical />
                        <YAxis formatValue={(value: number) => (value === 0 ? "" : String(value))} />
                        <XAxis />
                        <LatencyHoverBridge onHoverChange={setHover} />
                        <ChartTooltip
                            showDatePill
                            content={({ point }) => {
                                const { label, p50, p95 } = point as unknown as (typeof latencyRows)[number];
                                return (
                                    <TooltipContent
                                        title={label}
                                        rows={[
                                            { color: P50_COLOR, label: "p50", value: `${p50} ms` },
                                            { color: P95_COLOR, label: "p95", value: `${p95} ms` },
                                        ]}
                                    />
                                );
                            }}
                        />
                    </LineChart>
                </Box>
            </Box>
        </AnalyticsChartCard>
    );
};
