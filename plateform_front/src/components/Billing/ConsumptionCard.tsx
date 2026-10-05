import React, { useState } from "react";
import { Box, Card, HStack, SkeletonCircle, Stack, Text } from "@chakra-ui/react";
import { BarChart2 } from "lucide-react";
import {
    Bar,
    BarChart,
    BarXAxis,
    ChartTooltip,
    Grid,
    PieCenter,
    PieChart,
    PieSlice,
    type PieData,
} from "components/charts";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
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
const PIE_SIZE = 230;

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
    const totalPeriodCredits = byDay.reduce((s, v) => s + v, 0);
    const isEmpty = !isLoading && totalPeriodCredits === 0;

    const chartRows = getChartLabels(period).map((name, i) => ({
        name,
        value: byDay[i] ?? 0,
    }));

    const pieData: PieData[] = byAgent.map((a, i) => ({
        label: a.agentName,
        value: a.creditsUsed,
        color: AGENT_COLORS[i % AGENT_COLORS.length],
    }));

    return (
        <Stack spacing={0} flex={1} minH={0} display="flex" flexDirection="column">
            <HStack justify="space-between" flexWrap="wrap" gap={0} flexShrink={0}>
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="textPrimary">
                    Consommation
                </Text>
                <MultiOptionButtons
                    options={(["7j", "30j"] as Period[]).map((p) => ({
                        value: p,
                        label: p,
                    }))}
                    value={period}
                    onChange={setPeriod}
                />
            </HStack>

            <Text variant="body-xs-muted" mb={3} flexShrink={0}>
                {period === "7j" ? "7 derniers jours" : period === "30j" ? "30 derniers jours" : "90 derniers jours"}{" "}
                crédits utilisés
            </Text>

            {isEmpty ? (
                <Card size="none" flex={1} minH="180px" display="flex">
                    <CardEmptyState
                        icon={BarChart2}
                        title="Aucune consommation"
                        description={`Aucun crédit consommé sur ${period === "7j" ? "les 7 derniers jours" : period === "30j" ? "les 30 derniers jours" : "les 90 derniers jours"}.`}
                    />
                </Card>
            ) : (
                <Stack direction={{ base: "column", lg: "row" }} spacing={4} flex={1} minH={0} align="stretch">
                    <Card size="none" flex={6} minH={0} position="relative" overflow="hidden">
                        <Box position="absolute" inset={3}>
                            <BarChart
                                status={isLoading ? "loading" : "ready"}
                                data={chartRows}
                                xDataKey="name"
                                margin={{ top: 8, right: 0, bottom: 32, left: 0 }}
                                aspectRatio=""
                                className="h-full"
                            >
                                <Grid horizontal />
                                <Bar dataKey="value" fill="var(--chart-line-primary)" lineCap={BAR_RADIUS} />
                                <BarXAxis maxLabels={period === "90j" ? 4 : period === "30j" ? 10 : 7} />
                                <ChartTooltip
                                    showDatePill={false}
                                    showDots={false}
                                    rows={(point) => [
                                        {
                                            color: "var(--chart-line-primary)",
                                            label: "Crédits",
                                            value: (point.value as number) ?? 0,
                                        },
                                    ]}
                                />
                            </BarChart>
                        </Box>
                    </Card>

                    <Card size="md" flexShrink={0} flex={2} display="flex" flexDirection="column">
                        <Text variant="body-xs-muted" flexShrink={0}>
                            PAR AGENT
                        </Text>

                        <Box flex={1} minH={0} display="flex" alignItems="center" justifyContent="center">
                            {isLoading ? (
                                <SkeletonCircle boxSize={`${PIE_SIZE}px`} />
                            ) : (
                                <Box boxSize={`${PIE_SIZE}px`} flexShrink={0}>
                                    {agentTotal > 0 ? (
                                        <PieChart data={pieData} size={PIE_SIZE} innerRadius={70}>
                                            {pieData.map((_, i) => (
                                                <PieSlice key={i} index={i} />
                                            ))}
                                            <PieCenter defaultLabel="Crédits" />
                                        </PieChart>
                                    ) : (
                                        <Box boxSize="full" borderRadius="full" bg="borderDefault" />
                                    )}
                                </Box>
                            )}
                        </Box>

                        {!isLoading && byAgent.length > 0 && (
                            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} flexShrink={0}>
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
                        )}
                    </Card>
                </Stack>
            )}
        </Stack>
    );
};

export default ConsumptionCard;
