import { Box, HStack, Icon, Skeleton, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface MetricCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    trend: string;
    trendPositive: boolean;
    trendNeutral?: boolean;
    sparkData: number[];
    sparkColor?: string;
    isLoading?: boolean;
}

export const MetricCard = ({
    icon,
    label,
    value,
    trend,
    trendPositive,
    trendNeutral,
    sparkData,
    sparkColor,
    isLoading = false,
}: MetricCardProps) => {
    const valueCol = useColorModeValue("grey.900", "grey.50");
    const trendGreen = useColorModeValue("green.600", "green.400");
    const trendOrange = useColorModeValue("orange.500", "orange.300");
    const trendRed = useColorModeValue("red.500", "red.400");
    const trendCol = trendNeutral ? trendOrange : trendPositive ? trendGreen : trendRed;

    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    if (isLoading) {
        return (
            <Box
                bg="surfaceCard"
                border="1px solid"
                borderColor="borderDefault"
                borderRadius="12px"
                overflow="hidden"
                display="flex"
                flexDirection="column"
                gap={3}
                minH="140px"
            >
                <Stack p={4} spacing={2}>
                    <Skeleton {...skeletonProps} h="10px" w="110px" borderRadius="4px" />
                    <Skeleton {...skeletonProps} p={4} h="28px" w="80px" borderRadius="6px" />
                    <Skeleton {...skeletonProps} h="10px" w="60px" borderRadius="4px" />
                </Stack>
                <Box mt="auto" mx={-4}>
                    <Skeleton {...skeletonProps} h="70px" w="100%" borderRadius="0" />
                </Box>
            </Box>
        );
    }

    return (
        <Box
            bg="surfaceCard"
            border="1px solid"
            borderColor="borderDefault"
            borderRadius="12px"
            p={4}
            display="flex"
            flexDirection="column"
            gap={2}
        >
            <HStack spacing={1.5}>
                <Icon as={icon} boxSize={3} color="textLabel" />
                <Text fontSize="sm" color="textLabel">
                    {label}
                </Text>
            </HStack>

            <Text fontSize="3xl" fontWeight="700" color={valueCol}>
                {value}
            </Text>

            <HStack spacing={1}>
                <Icon
                    as={trendPositive && !trendNeutral ? TrendingUp : trendNeutral ? TrendingUp : TrendingDown}
                    boxSize={3}
                    color={trendCol}
                />
                <Text fontSize="xs" fontWeight="600" color={trendCol}>
                    {trend}
                </Text>
            </HStack>

            <Box mt="auto" mx={-4} h="70px" position="relative" minW={0}>
                <Box position="absolute" inset={0}>
                    <Line
                    data={{
                        labels: sparkData.map(() => ""),
                        datasets: [
                            {
                                data: sparkData,
                                borderColor: sparkColor ?? "#34D3A9",
                                borderWidth: 1.5,
                                fill: true,
                                backgroundColor: (ctx) => {
                                    const color = sparkColor ?? "#34D3A9";
                                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 70);
                                    gradient.addColorStop(0, hexToRgba(color, 0.3));
                                    gradient.addColorStop(1, hexToRgba(color, 0));
                                    return gradient;
                                },
                                tension: 0.4,
                                pointRadius: 0,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: false,
                        plugins: { legend: { display: false }, tooltip: { enabled: false } },
                        scales: {
                            x: { display: false },
                            y: { display: false },
                        },
                        elements: { line: { borderCapStyle: "round", borderJoinStyle: "round" } },
                    }}
                    />
                </Box>
            </Box>
        </Box>
    );
};
