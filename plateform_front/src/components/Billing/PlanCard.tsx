import React from "react";
import { Box, Card, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useParams } from "react-router-dom";
import { useGetCreditBalanceQuery } from "services/credit/credit";
import { useIsDark } from "hooks/useIsDark";

const TIER_DATA: Record<string, { displayName: string }> = {
    free: { displayName: "Découverte" },
    pro: { displayName: "Pro" },
    business: { displayName: "Business" },
    enterprise: { displayName: "Enterprise" },
};

interface PlanCardProps {
    tier: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ tier }) => {
    const { workspaceId } = useParams();
    const { data: creditBalance } = useGetCreditBalanceQuery(workspaceId ?? "", {
        skip: !workspaceId,
    });

    const isDark = useIsDark();
    const data = TIER_DATA[tier] ?? TIER_DATA.free;

    const now = new Date();
    const daysFromMonday = (now.getDay() + 6) % 7;
    const lastMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
    const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

    const total = creditBalance?.totalGranted ?? 0;
    const balance = creditBalance?.balance ?? 0;
    const consumed = total > 0 ? total - balance : 0;
    const progress = total > 0 ? Math.min(100, Math.round((consumed / total) * 100)) : 0;

    return (
        <Card size="none" variant="attachedTop" p={{ base: 4, md: 5 }}>
            <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
                <VStack align="start" spacing={0.5}>
                    <Text variant="caption-xs-muted">Plan actuel</Text>
                    <HStack spacing={2} flexWrap="wrap">
                        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="textPrimary">
                            {data.displayName}
                        </Text>
                        <HStack bg="rgba(52,211,169,0.12)" px={2} py={0.5} borderRadius="full" spacing={1}>
                            <Box w={1.5} h={1.5} borderRadius="full" bg={currentDarkTheme.primary} />
                            <Text fontSize="xs" color={currentDarkTheme.primary} fontWeight="semibold">
                                Actif
                            </Text>
                        </HStack>
                    </HStack>
                </VStack>
            </HStack>

            <Stack direction={{ base: "column", md: "row" }} spacing={5} align={{ base: "center", md: "start" }}>
                <VStack flex={1} align="stretch" spacing={3} minW={0} w="100%">
                    <Box>
                        <Text variant="caption-sm-muted" mb={1}>
                            Crédits du cycle
                        </Text>
                        <HStack align="baseline" spacing={1} mb={1.5} flexWrap="wrap">
                            <Text fontSize="xl" fontWeight="bold" color="textPrimary">
                                {consumed.toLocaleString("fr-FR")}{" "}
                            </Text>
                            <Text variant="body-md-muted">/ {total.toLocaleString("fr-FR")} consommés</Text>
                        </HStack>
                        <Box h="10px" bg={isDark ? "grey.700" : "grey.200"} borderRadius="full" overflow="hidden">
                            <Box
                                h="10px"
                                w={`${progress}%`}
                                bgGradient="linear(to-r, green.400, green.600)"
                                borderRadius="full"
                                transition="width 0.5s"
                            />
                        </Box>
                        <HStack justify="space-between" mt={1} flexWrap="wrap" gap={1}>
                            <Text variant="body-sm-muted">Cycle commencé le {fmt(lastMonday)}</Text>
                        </HStack>
                    </Box>
                </VStack>
            </Stack>
        </Card>
    );
};

export default PlanCard;
