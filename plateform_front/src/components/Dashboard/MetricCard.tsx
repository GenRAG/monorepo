import { Box, HStack, Icon, Text, useColorModeValue } from "@chakra-ui/react";
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
}: MetricCardProps) => {
    const cardBg = useColorModeValue("white", "grey.850");
    const border = useColorModeValue("grey.100", "grey.800");
    const labelCol = useColorModeValue("grey.500", "grey.400");
    const valueCol = useColorModeValue("grey.900", "grey.50");
    const trendGreen = useColorModeValue("green.600", "green.400");
    const trendOrange = useColorModeValue("orange.500", "orange.300");
    const trendRed = useColorModeValue("red.500", "red.400");
    const trendCol = trendNeutral
        ? trendOrange
        : trendPositive
          ? trendGreen
          : trendRed;

    return (
        <Box
            bg={cardBg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            p={4}
            display="flex"
            flexDirection="column"
            gap={2}
        >
            <HStack spacing={1.5}>
                <Icon as={icon} boxSize={3} color={labelCol} />
                <Text fontSize="sm" color={labelCol}>
                    {label}
                </Text>
            </HStack>

            <Text fontSize="3xl" fontWeight="700" color={valueCol}>
                {value}
            </Text>

            <HStack spacing={1}>
                <Icon
                    as={
                        trendPositive && !trendNeutral
                            ? TrendingUp
                            : trendNeutral
                              ? TrendingUp
                              : TrendingDown
                    }
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
