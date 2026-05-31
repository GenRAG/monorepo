import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Box, HStack, Skeleton, VStack, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { BarChart2 } from "lucide-react";
import { useState } from "react";
import { type Period } from "pages/Dashboard/data";
import { ActivityMetrics } from "components/Dashboard/ActivityChart/ActivityMetrics";
import { ActivityHeader } from "components/Dashboard/ActivityChart/ActivityHeader";
import { ActivityLegend } from "components/Dashboard/ActivityChart/ActivityLegend";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { WorkspaceStats } from "types/workspace";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface ActivityChartProps {
    chartData?: WorkspaceStats["activityChart"];
    totalConversations?: number;
    todayConversations?: number;
    isEmpty?: boolean;
    isLoading?: boolean;
}

export const ActivityChart = ({
    chartData,
    totalConversations = 0,
    todayConversations = 0,
    isEmpty = false,
    isLoading = false,
}: ActivityChartProps) => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

    const cardBg = useColorModeValue("white", "grey.850");
    const border = useColorModeValue("grey.100", "grey.800");
    const skeletonStart = useColorModeValue("grey.100", "grey.800");
    const skeletonEnd = useColorModeValue("grey.200", "grey.700");
    const skeletonProps = { startColor: skeletonStart, endColor: skeletonEnd };

    const [period, setPeriod] = useState<Period>("7j");

    const periodData = chartData?.[period] ?? { labels: [], values: [] };
    const { labels, values } = periodData;

    const chartJsData = {
        labels,
        datasets: [
            {
                data: values,
                fill: true,
                tension: 0.4,
                borderColor: "#12B98C",
                borderWidth: 2,
                pointRadius: 0,
                pointStyle: "circle",
                pointBackgroundColor: "#12B98C",
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "#12B98C",
                pointHoverBorderColor: isDark ? "#2E2E2E" : "#fff",
                pointHoverBorderWidth: 2,
                backgroundColor: (ctx: { chart: ChartJS }) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
                    gradient.addColorStop(0, "rgba(18, 185, 140, 0.28)");
                    gradient.addColorStop(1, "rgba(18, 185, 140, 0.01)");
                    return gradient;
                },
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                usePointStyle: true,
                displayColors: true,
                boxWidth: 6,
                boxHeight: 6,
                backgroundColor: isDark ? "#262626" : "#fff",
                titleColor: isDark ? "#F6F6F6" : "#262626",
                bodyColor: isDark ? "#8F8F8F" : "#6D6D6D",
                borderColor: isDark ? "#4F4F4F" : "#E7E7E7",
                borderWidth: 1,
                padding: 8,
                callbacks: {
                    label: (ctx) => ` ${(ctx.parsed.y ?? 0).toLocaleString("fr-FR")} conversations`,
                    labelPointStyle: () => ({ pointStyle: "circle", rotation: 0 }),
                },
            },
        },
        scales: {
            x: { display: false, grid: { display: false } },
            y: { display: false, grid: { display: false } },
        },
    };

    if (isLoading) {
        return (
            <Box bg={cardBg} border="1px solid" borderColor={border} borderRadius="12px" overflow="hidden">
                <HStack justify="space-between" p={4}>
                    <HStack spacing={2}>
                        <Skeleton {...skeletonProps} h="14px" w="14px" borderRadius="3px" />
                        <Skeleton {...skeletonProps} h="14px" w="160px" borderRadius="4px" />
                    </HStack>
                    <HStack spacing={1}>
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} {...skeletonProps} h="24px" w="40px" borderRadius="6px" />
                        ))}
                    </HStack>
                </HStack>
                <HStack px={4} spacing={6} flexWrap="wrap">
                    {[0, 1, 2].map((i) => (
                        <VStack key={i} align="start" spacing={1} py={2}>
                            <Skeleton {...skeletonProps} h="11px" w="60px" borderRadius="3px" />
                            <Skeleton {...skeletonProps} h="24px" w="80px" borderRadius="4px" />
                            <Skeleton {...skeletonProps} h="11px" w="50px" borderRadius="3px" />
                        </VStack>
                    ))}
                </HStack>
                <Skeleton {...skeletonProps} h="200px" w="100%" borderRadius="0" />
                <HStack p={4} spacing={4}>
                    <Skeleton {...skeletonProps} h="12px" w="80px" borderRadius="4px" />
                    <Skeleton {...skeletonProps} h="12px" w="60px" borderRadius="4px" />
                </HStack>
            </Box>
        );
    }

    return (
        <Box bg={cardBg} border="1px solid" borderColor={border} borderRadius="12px" overflow="hidden" minW={0}>
            <ActivityHeader period={period} setPeriod={setPeriod} />

            {isEmpty ? (
                <CardEmptyState
                    icon={BarChart2}
                    title="Aucune conversation"
                    description="Les métriques d'activité apparaîtront une fois vos agents en production."
                />
            ) : (
                <>
                    <ActivityMetrics total={totalConversations} today={todayConversations} period={period} />
                    <Box h="200px" position="relative">
                        <Line data={chartJsData} options={options} />
                    </Box>
                    <ActivityLegend />
                </>
            )}
        </Box>
    );
};
