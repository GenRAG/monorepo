import { Box, HStack, Icon, Skeleton, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Sparkline } from "components/Deployment/Sparkline";

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

            <Box mt="auto" mx={-4}>
                <Sparkline
                    width="full"
                    data={sparkData}
                    id={label}
                    color={sparkColor ?? "var(--chakra-colors-green-500)"}
                />
            </Box>
        </Box>
    );
};
