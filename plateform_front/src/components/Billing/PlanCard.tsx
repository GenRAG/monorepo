import React from "react";
import { Box, HStack, Stack, Text, VStack, useColorMode } from "@chakra-ui/react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { useParams } from "react-router-dom";
import { useGetCreditBalanceQuery } from "services/credit/credit";

const TIER_DATA: Record<
    string,
    {
        displayName: string;
        total: number;
    }
> = {
    free: {
        displayName: "Découverte",
        total: 200,
    },
    pro: {
        displayName: "Pro",
        total: 3000,
    },
    business: {
        displayName: "Business",
        total: 5000,
    },
    enterprise: {
        displayName: "Enterprise",
        total: 20000,
    },
};

interface PlanCardProps {
    tier: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ tier }) => {
    const { colorMode } = useColorMode();
    const { workspaceId } = useParams();
    const { data: creditBalance } = useGetCreditBalanceQuery(workspaceId ?? "", {
        skip: !workspaceId,
    });
    console.log(creditBalance, "creditBalance");

    const isDark = colorMode === "dark";

    const data = TIER_DATA[tier] ?? TIER_DATA.free;
    const now = new Date();
    const daysFromMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - daysFromMonday);
    lastMonday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(lastMonday);
    nextMonday.setDate(lastMonday.getDate() + 7);
    const cycleStart = lastMonday.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    const renewalDate = nextMonday.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    const resetDays = Math.ceil((nextMonday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const consumed = creditBalance !== undefined ? data.total - creditBalance : 0;
    const progress = Math.min(100, Math.round((consumed / data.total) * 100));
    const sub = isDark ? "grey.400" : "grey.500";
    const border = isDark ? "grey.700" : "grey.100";

    return (
        <Box
            bg={isDark ? "grey.950" : "white"}
            border="1px solid"
            borderBottom="none"
            borderColor={border}
            borderRadius="12px"
            borderBottomRadius="0"
            p={{ base: 4, md: 5 }}
        >
            <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
                <VStack align="start" spacing={0.5}>
                    <Text fontSize="9px" letterSpacing="wider" textTransform="uppercase" color={sub}>
                        Plan actuel
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                        <Text
                            fontSize={{ base: "lg", md: "xl" }}
                            fontWeight="bold"
                            color={isDark ? "white" : "grey.900"}
                        >
                            {data.displayName}
                        </Text>
                        <HStack bg="rgba(52,211,169,0.12)" px={2} py={0.5} borderRadius="full" spacing={1}>
                            <Box w={1.5} h={1.5} borderRadius="full" bg={currentDarkTheme.primary} />
                            <Text fontSize="xs" color={currentDarkTheme.primary} fontWeight="semibold">
                                Actif
                            </Text>
                        </HStack>
                    </HStack>
                    <Text fontSize="xs" color={sub}>
                        Renouvellement le {renewalDate} · hebdomadaire
                    </Text>
                </VStack>
            </HStack>

            <Stack direction={{ base: "column", md: "row" }} spacing={5} align={{ base: "center", md: "start" }}>
                <VStack flex={1} align="stretch" spacing={3} minW={0} w="100%">
                    <Box>
                        <Text fontSize="12px" textTransform="uppercase" letterSpacing="wider" color={sub} mb={1}>
                            Crédits du cycle
                        </Text>
                        <HStack align="baseline" spacing={1} mb={1.5} flexWrap="wrap">
                            <Text fontSize="xl" fontWeight="bold" color={isDark ? "white" : "grey.900"}>
                                {consumed.toLocaleString("fr-FR")}{" "}
                            </Text>
                            <Text fontSize="md" color={sub}>
                                / {data.total.toLocaleString("fr-FR")} consommés
                            </Text>
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
                            <Text fontSize="13px" color={sub}>
                                Cycle commencé le {cycleStart}
                            </Text>
                            <Text fontSize="13px" color={sub}>
                                Reset dans {resetDays} jours
                            </Text>
                        </HStack>
                    </Box>
                </VStack>
            </Stack>
        </Box>
    );
};

export default PlanCard;
