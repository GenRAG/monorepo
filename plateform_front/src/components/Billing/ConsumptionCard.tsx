import React, { useState } from "react";
import { Box, Card, HStack, Stack, Text, Tooltip as ChakraTooltip, Skeleton } from "@chakra-ui/react";
import { Bar, BarChart, BarXAxis, ChartTooltip, useChart, Grid } from "components/charts";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import MultiOptionButtons from "components/ui/MultiOptionButtons";
import { useGetWorkspaceConsumptionQuery } from "services/credit/credit";
import { useParams } from "react-router-dom";

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

const BAR_RADIUS = 6;

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
    const { data: consumption, isLoading } = useGetWorkspaceConsumptionQuery(
        { workspaceId: workspaceId ?? "", days },
        { skip: !workspaceId },
    );

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
