import React, { useMemo, useState } from "react";
import { Box, Card, HStack, Stack, Text, Tooltip as ChakraTooltip, Skeleton } from "@chakra-ui/react";
import { Bar, BarChart, BarXAxis, ChartTooltip, useChart, Grid } from "components/charts";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import MultiOptionButtons from "components/ui/MultiOptionButtons";
import { useGetWorkspaceConsumptionQuery, type WorkspaceConsumption } from "services/credit/credit";
import { useParams } from "react-router-dom";

// TEMP: visual QA for the BarChart/BackgroundTrack rounding against non-empty data.
// Remove once real consumption data is confirmed to render correctly.
const DEBUG_USE_MOCK_CONSUMPTION = true;

const MOCK_AGENTS = [
    { agentId: "mock-1", agentName: "Demo Assistant" },
    { agentId: "mock-2", agentName: "Agent Conversationnel Avancé" },
    { agentId: "mock-3", agentName: "ZAgent Conversationnel Avancé" },
];

const buildMockConsumption = (days: number): WorkspaceConsumption => {
    const byDay = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const base = isWeekend ? 8 : 22;
        return Math.max(0, Math.round(base + (Math.random() - 0.5) * 16));
    });

    const total = byDay.reduce((s, v) => s + v, 0);
    const shares = [0.5, 0.32, 0.18];
    const byAgent = MOCK_AGENTS.map((agent, i) => ({
        ...agent,
        creditsUsed: Math.max(1, Math.round(total * shares[i])),
        queryCount: Math.max(1, Math.round((total * shares[i]) / 1.4)),
    }));

    return { byDay, byAgent, total };
};

const AGENT_COLORS = [
    currentDarkTheme.hex.primary,
    "#6366F1",
    "#F59E0B",
    "#EC4899",
    "#A855F7",
    "#3B82F6",
    "#EF4444",
    "#10B981",
];

/**
 * Same corner radius as the `<Bar lineCap={...} />` below, so the track matches the bars.
 * `rx`/`ry` round all 4 corners of the rect (the lib has no top-only option), so this must
 * stay small — anything much bigger than this makes tall bars look like floating capsules
 * and turns short bars into blobs.
 */
const BAR_RADIUS = 6;

/**
 * Faint full-height track behind each bar, matching the previous chart.js plugin.
 * Named `keyPrefix`, not `dataKey` — `BarChart`'s `extractBarConfigs` treats any child
 * with a `dataKey` prop as a real bar series, which would double the detected series
 * count and make the actual `<Bar>` render at half width to "group" with this track.
 */
const BackgroundTrack = ({ keyPrefix }: { keyPrefix: string }) => {
    const { data, barScale, bandWidth, barXAccessor, innerHeight } = useChart();
    if (!(barScale && bandWidth && barXAccessor)) return null;
    return (
        <>
            {data.map((d, i) => {
                const x = barScale(barXAccessor(d)) ?? 0;
                return (
                    <rect
                        key={`${keyPrefix}-track-${i}`}
                        x={x}
                        y={0}
                        width={bandWidth}
                        height={innerHeight}
                        rx={BAR_RADIUS}
                        ry={BAR_RADIUS}
                        fill="var(--chart-grid)"
                    />
                );
            })}
        </>
    );
};

type Period = "7j" | "30j" | "90j";

const PERIOD_DAYS: Record<Period, number> = { "7j": 7, "30j": 30, "90j": 90 };

const FR_DAYS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const FR_MONTHS = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sep.", "oct.", "nov.", "déc."];

const daysAgo = (n: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
};

const fmtDay = (d: Date) => FR_DAYS[d.getDay()];
const fmtDate = (d: Date) => `${d.getDate()} ${FR_MONTHS[d.getMonth()]}`;

const getChartLabels = (period: Period): string[] => {
    if (period === "7j") return Array.from({ length: 7 }, (_, i) => (i === 6 ? "Auj." : fmtDay(daysAgo(6 - i))));
    if (period === "30j")
        return Array.from({ length: 30 }, (_, i) => (i === 29 ? "Auj." : String(daysAgo(29 - i).getDate())));
    return Array.from({ length: 90 }, (_, i) => (i === 89 ? "Auj." : fmtDate(daysAgo(89 - i))));
};

const ConsumptionCard: React.FC = () => {
    const { workspaceId } = useParams();
    const [period, setPeriod] = useState<Period>("30j");

    const days = PERIOD_DAYS[period];
    const { data: realConsumption, isLoading: isQueryLoading } = useGetWorkspaceConsumptionQuery(
        { workspaceId: workspaceId ?? "", days },
        { skip: !workspaceId || DEBUG_USE_MOCK_CONSUMPTION },
    );
    const mockConsumption = useMemo(() => buildMockConsumption(days), [days]);
    const consumption = DEBUG_USE_MOCK_CONSUMPTION ? mockConsumption : realConsumption;
    const isLoading = DEBUG_USE_MOCK_CONSUMPTION ? false : isQueryLoading;

    const byDay = consumption?.byDay ?? [];
    const byAgent = consumption?.byAgent ?? [];
    const agentTotal = byAgent.reduce((s, a) => s + a.creditsUsed, 0);

    const chartRows = getChartLabels(period).map((name, i) => ({
        name,
        value: byDay[i] ?? 0,
    }));

    return (
        <Card size="none" variant="attachedBottom" h="100%" display="flex" flexDirection="column">
            <Stack p={{ base: 3, md: 4 }} spacing={0} flex={1} minH={0} display="flex" flexDirection="column">
                <HStack justify="space-between" flexWrap="wrap" gap={0} flexShrink={0}>
                    <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="textPrimary">
                        Consommation
                    </Text>
                    <MultiOptionButtons
                        options={(["7j", "30j", "90j"] as Period[]).map((p) => ({
                            value: p,
                            label: p,
                        }))}
                        value={period}
                        onChange={setPeriod}
                    />
                </HStack>

                <Text variant="body-xs-muted" mb={3} flexShrink={0}>
                    {period === "7j"
                        ? "7 derniers jours"
                        : period === "30j"
                          ? "30 derniers jours"
                          : "90 derniers jours"}{" "}
                    crédits utilisés
                </Text>

                <Box flex={1} minH="80px" position="relative" w="100%" minW={0}>
                    <Box position="absolute" inset={0}>
                        <BarChart
                            status={isLoading ? "loading" : "ready"}
                            data={chartRows}
                            xDataKey="name"
                            margin={{ top: 8, right: 0, bottom: 32, left: 0 }}
                            aspectRatio=""
                            className="h-full"
                        >
                            <Grid horizontal />
                            <BackgroundTrack keyPrefix="value" />
                            <Bar dataKey="value" fill="var(--chart-line-primary)" lineCap={BAR_RADIUS} />
                            <BarXAxis maxLabels={period === "90j" ? 4 : period === "30j" ? 10 : 7} />
                            <ChartTooltip showDatePill={false} showDots={false} />
                        </BarChart>
                    </Box>
                </Box>
            </Stack>

            <Box borderTop="1px solid" borderColor="borderDefault" p={{ base: 4, md: 5 }} flexShrink={0}>
                <Text variant="body-xs-muted" mb={3}>
                    PAR AGENT
                </Text>

                {isLoading ? (
                    <Skeleton h="10px" borderRadius="full" mb={3} />
                ) : byAgent.length === 0 ? (
                    <Text variant="body-xs-muted" mb={3}>
                        Aucune consommation sur cette période.
                    </Text>
                ) : (
                    <>
                        <HStack spacing={0} borderRadius="full" overflow="hidden" h="10px" mb={3}>
                            {byAgent.map((a, i) => (
                                <ChakraTooltip
                                    key={a.agentId}
                                    label={`${a.agentName}: ${agentTotal > 0 ? Math.round((a.creditsUsed / agentTotal) * 100) : 0}%`}
                                    bg={AGENT_COLORS[i % AGENT_COLORS.length]}
                                    placement="top"
                                    color="white"
                                    borderRadius="8px"
                                    hasArrow
                                >
                                    <Box
                                        flex={a.creditsUsed}
                                        h="full"
                                        bg={AGENT_COLORS[i % AGENT_COLORS.length]}
                                        cursor="pointer"
                                    />
                                </ChakraTooltip>
                            ))}
                        </HStack>

                        <Box display="flex" flexWrap="wrap" gap={2}>
                            {byAgent.map((a, i) => (
                                <HStack key={a.agentId} spacing={1.5}>
                                    <Box
                                        w={2}
                                        h={2}
                                        borderRadius="full"
                                        bg={AGENT_COLORS[i % AGENT_COLORS.length]}
                                        flexShrink={0}
                                    />
                                    <Text fontSize="10px" color="textLabel">
                                        {a.agentName} - {a.creditsUsed}
                                    </Text>
                                </HStack>
                            ))}
                        </Box>
                    </>
                )}
            </Box>
        </Card>
    );
};

export default ConsumptionCard;
