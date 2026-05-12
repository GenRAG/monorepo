import React, { useState } from "react";
import { Box, HStack, Text, useColorMode } from "@chakra-ui/react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    type Plugin,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const backgroundBarsPlugin: Plugin<"bar"> = {
    id: "backgroundBars",
    beforeDatasetsDraw(chart) {
        const {
            ctx,
            chartArea: { top, bottom },
        } = chart;
        chart.getDatasetMeta(0).data.forEach((bar: any) => {
            ctx.save();
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
            ctx.beginPath();
            ctx.roundRect(
                bar.x - bar.width / 2,
                top,
                bar.width,
                bottom - top,
                2,
            );
            ctx.fill();
            ctx.restore();
        });
    },
};

type Period = "7j" | "30j" | "90j";

const AGENTS = [
    { name: "Assistant juridique", count: 248, color: "#34D3A9" },
    { name: "Support produit", count: 162, color: "#6366F1" },
    { name: "Onboarding sales", count: 92, color: "#F59E0B" },
    { name: "Ops interne", count: 64, color: "#EC4899" },
    { name: "Recrutement", count: 42, color: "#A855F7" },
];

const AGENT_TOTAL = AGENTS.reduce((s, a) => s + a.count, 0);

const BAR_DATA: Record<Period, number[]> = {
    "7j": [52, 38, 65, 48, 61, 55, 65],
    "30j": [
        12, 18, 8, 22, 35, 28, 15, 42, 38, 25, 31, 19, 44, 52, 38, 29, 46, 58,
        42, 35, 48, 62, 55, 40, 33, 51, 45, 38, 55, 65,
    ],
    "90j": Array.from({ length: 90 }, (_, i) =>
        Math.round(20 + 40 * Math.abs(Math.sin(i * 0.18)) + i * 0.3),
    ),
};

const TOTALS: Record<Period, number> = { "7j": 384, "30j": 848, "90j": 2410 };
const TRENDS: Record<Period, string> = {
    "7j": "+8%",
    "30j": "+12%",
    "90j": "+31%",
};
const DATE_LABELS: Record<Period, [string, string, string, string]> = {
    "7j": ["Lun", "Mar", "Mer", "Jeu"],
    "30j": ["21 mars", "5 avr.", "20 avr.", "Aujourd'hui"],
    "90j": ["1 fév.", "1 mars", "1 avr.", "Aujourd'hui"],
};

const ConsumptionCard: React.FC = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const [period, setPeriod] = useState<Period>("30j");
    const sub = isDark ? "grey.400" : "grey.500";
    const border = isDark ? "grey.700" : "grey.200";

    const data = BAR_DATA[period];
    const labels = DATE_LABELS[period];

    const chartData = {
        labels: data.map(() => ""),
        datasets: [
            {
                data,
                backgroundColor: currentDarkTheme.rgba.primary,
                borderRadius: 2,
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
            x: { display: false },
            y: { display: false, grid: { display: false } },
        },
    };

    return (
        <Box
            bg={isDark ? "grey.950" : "white"}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            p={5}
            h="100%"
        >
            <HStack justify="space-between" mb={1}>
                <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={isDark ? "white" : "grey.900"}
                >
                    Consommation
                </Text>
                <HStack spacing={1}>
                    {(["7j", "30j", "90j"] as Period[]).map((p) => (
                        <Box
                            key={p}
                            px={2.5}
                            py={0.5}
                            borderRadius="6px"
                            cursor="pointer"
                            bg={
                                period === p
                                    ? isDark
                                        ? "grey.700"
                                        : "grey.100"
                                    : "transparent"
                            }
                            onClick={() => setPeriod(p)}
                        >
                            <Text
                                fontSize="xs"
                                fontWeight={period === p ? "600" : "400"}
                                color={
                                    period === p
                                        ? isDark
                                            ? "white"
                                            : "grey.900"
                                        : sub
                                }
                            >
                                {p}
                            </Text>
                        </Box>
                    ))}
                </HStack>
            </HStack>

            <Text fontSize="xs" color={sub} mb={3}>
                {period === "7j"
                    ? "7 derniers jours"
                    : period === "30j"
                      ? "30 derniers jours"
                      : "90 derniers jours"}{" "}
                · crédits utilisés
            </Text>

            <HStack spacing={3} mb={4} align="center">
                <Text
                    fontSize="3xl"
                    fontWeight="bold"
                    color={isDark ? "white" : "grey.900"}
                    letterSpacing="-0.02em"
                >
                    {TOTALS[period].toLocaleString("fr-FR")}
                </Text>
                <Text fontSize="sm" color={sub}>
                    crédits
                </Text>
                <HStack
                    bg="rgba(52,211,169,0.12)"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    spacing={1}
                >
                    <Text
                        fontSize="xs"
                        color={currentDarkTheme.primary}
                        fontWeight="semibold"
                    >
                        ↑ {TRENDS[period]} vs cycle précédent
                    </Text>
                </HStack>
            </HStack>

            <Box h="80px" position="relative" w="100%" mb={1}>
                <Bar
                    data={chartData}
                    options={chartOptions}
                    plugins={[backgroundBarsPlugin]}
                />
            </Box>

            <HStack justify="space-between" mb={4}>
                {labels.map((l) => (
                    <Text key={l} fontSize="9px" color={sub}>
                        {l}
                    </Text>
                ))}
            </HStack>

            <Box pt={3} borderTop="1px solid" borderColor={border}>
                <HStack justify="space-between" mb={2}>
                    <Text
                        fontSize="9px"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color={sub}
                    >
                        Par agent
                    </Text>
                    <Text
                        fontSize="xs"
                        color={currentDarkTheme.primary}
                        cursor="pointer"
                    >
                        Voir tout →
                    </Text>
                </HStack>

                <HStack
                    spacing={0}
                    borderRadius="full"
                    overflow="hidden"
                    h="6px"
                    mb={3}
                >
                    {AGENTS.map((a) => (
                        <Box
                            key={a.name}
                            flex={a.count / AGENT_TOTAL}
                            h="full"
                            bg={a.color}
                        />
                    ))}
                </HStack>

                <Box display="flex" flexWrap="wrap" gap={2}>
                    {AGENTS.map((a) => (
                        <HStack key={a.name} spacing={1.5}>
                            <Box
                                w={2}
                                h={2}
                                borderRadius="full"
                                bg={a.color}
                                flexShrink={0}
                            />
                            <Text fontSize="10px" color={sub}>
                                {a.name} · {a.count}
                            </Text>
                        </HStack>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default ConsumptionCard;
