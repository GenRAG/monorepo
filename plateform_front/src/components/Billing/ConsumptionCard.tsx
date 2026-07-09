import React, { useState, useMemo } from "react";
import {
    Box,
    HStack,
    Stack,
    Text,
    Tooltip as ChakraTooltip,
    useColorMode,
    useToken,
    useColorModeValue,
    Skeleton,
} from "@chakra-ui/react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, type Plugin } from "chart.js";
import { Bar } from "react-chartjs-2";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import MultiOptionButtons from "components/ui/MultiOptionButtons";
import { useGetWorkspaceConsumptionQuery } from "services/credit/credit";
import { useParams } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const AGENT_COLORS = ["#34D3A9", "#6366F1", "#F59E0B", "#EC4899", "#A855F7", "#3B82F6", "#EF4444", "#10B981"];

const makeBackgroundBarsPlugin = (isDark: boolean): Plugin<"bar"> => ({
    id: "backgroundBars",
    beforeDatasetsDraw(chart) {
        const {
            ctx,
            chartArea: { top, bottom },
        } = chart;
        chart.getDatasetMeta(0).data.forEach((bar: any) => {
            ctx.save();
            ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)";
            ctx.beginPath();
            ctx.roundRect(bar.x - bar.width / 2, top, bar.width, bottom - top, 2);
            ctx.fill();
            ctx.restore();
        });
    },
});

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
    const { colorMode } = useColorMode();
    const { workspaceId } = useParams();
    const isDark = colorMode === "dark";
    const [period, setPeriod] = useState<Period>("30j");
    const sub = useColorModeValue("grey.500", "grey.400");
    const border = useColorModeValue("grey.100", "grey.700");
    const [subColor] = useToken("colors", [isDark ? "grey.400" : "grey.500"]);

    const backgroundBarsPlugin = useMemo(() => makeBackgroundBarsPlugin(isDark), [isDark]);

    const days = PERIOD_DAYS[period];
    const { data: consumption, isLoading } = useGetWorkspaceConsumptionQuery(
        { workspaceId: workspaceId ?? "", days },
        { skip: !workspaceId },
    );

    const byDay = consumption?.byDay ?? [];
    const byAgent = consumption?.byAgent ?? [];
    const agentTotal = byAgent.reduce((s, a) => s + a.creditsUsed, 0);

    const chartData = {
        labels: getChartLabels(period),
        datasets: [
            {
                data: byDay,
                backgroundColor: currentDarkTheme.rgba.primary,
                borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
                borderSkipped: false,
                barPercentage: 0.8,
                categoryPercentage: 0.9,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
            x: {
                display: true,
                ticks: {
                    color: subColor,
                    font: { size: period === "30j" ? 7 : 9 },
                    maxTicksLimit: period === "90j" ? 4 : undefined,
                    maxRotation: 0,
                    minRotation: 0,
                    padding: 2,
                },
                grid: { display: false },
                border: { display: false },
            },
            y: { display: false, grid: { display: false } },
        },
    };

    return (
        <Box
            bg={isDark ? "grey.950" : "white"}
            border="1px solid"
            borderTop="none"
            borderColor={border}
            borderRadius="12px"
            borderTopRadius="none"
            h="100%"
            display="flex"
            flexDirection="column"
        >
            <Stack p={{ base: 3, md: 4 }} spacing={0} flex={1} minH={0} display="flex" flexDirection="column">
                <HStack justify="space-between" flexWrap="wrap" gap={0} flexShrink={0}>
                    <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={isDark ? "white" : "grey.900"}>
                        Consommation
                    </Text>
                    <MultiOptionButtons
                        options={(["7j", "30j", "90j"] as Period[]).map((p) => ({ value: p, label: p }))}
                        value={period}
                        onChange={setPeriod}
                    />
                </HStack>

                <Text fontSize="xs" color={sub} mb={3} flexShrink={0}>
                    {period === "7j"
                        ? "7 derniers jours"
                        : period === "30j"
                          ? "30 derniers jours"
                          : "90 derniers jours"}{" "}
                    crédits utilisés
                </Text>

                <Box flex={1} minH="80px" position="relative" w="100%" minW={0}>
                    {isLoading ? (
                        <Skeleton h="100%" borderRadius="8px" />
                    ) : (
                        <Box position="absolute" inset={0}>
                            <Bar data={chartData} options={chartOptions} plugins={[backgroundBarsPlugin]} />
                        </Box>
                    )}
                </Box>
            </Stack>

            <Box borderTop="1px solid" borderColor={border} p={{ base: 4, md: 5 }} flexShrink={0}>
                <Text fontSize="12px" color={sub} mb={3}>
                    PAR AGENT
                </Text>

                {isLoading ? (
                    <Skeleton h="10px" borderRadius="full" mb={3} />
                ) : byAgent.length === 0 ? (
                    <Text fontSize="xs" color={sub} mb={3}>
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
                                    <Text fontSize="10px" color={sub}>
                                        {a.agentName} - {a.creditsUsed}
                                    </Text>
                                </HStack>
                            ))}
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default ConsumptionCard;
