import { HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";

interface ActivityMetricsProps {
    total: number;
    today: number;
    period: string;
}

export const ActivityMetrics = ({ total, today, period }: ActivityMetricsProps) => {
    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");

    const avgPerDay = period === "30j" ? Math.round(total / 30) : period === "7j" ? Math.round(total / 7) : today;

    return (
        <HStack px={4} mt={3} spacing={6} flexWrap="wrap" rowGap={3} pb={2} w="100%">
            <VStack align="start" spacing={0}>
                <Text variant="caption-xs" color={textSecondary}>
                    Total
                </Text>
                <HStack spacing={2} align="baseline" flexWrap="wrap">
                    <Text fontSize="xl" fontWeight="700" color={textPrimary}>
                        {total.toLocaleString("fr-FR")}
                    </Text>
                </HStack>
            </VStack>
            <VStack align="start" spacing={0}>
                <Text variant="caption-xs" color={textSecondary}>
                    Aujourd&apos;hui
                </Text>
                <Text fontSize="xl" fontWeight="700" color={textPrimary}>
                    {today.toLocaleString("fr-FR")}
                </Text>
            </VStack>
            <VStack align="start" spacing={0}>
                <Text variant="caption-xs" color={textSecondary}>
                    Moy / jour
                </Text>
                <Text fontSize="xl" fontWeight="700" color={textPrimary}>
                    {avgPerDay.toLocaleString("fr-FR")}
                </Text>
            </VStack>
        </HStack>
    );
};
