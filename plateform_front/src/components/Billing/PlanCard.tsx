import React from "react";
import { Box, Card, HStack, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { ParentSize } from "@visx/responsive";
import { Gauge } from "components/charts";
import { useParams } from "react-router-dom";
import { useGetCreditBalanceQuery } from "services/credit/credit";

// Target width (px) of one notch + its gap, so notch count adapts to the
// gauge's rendered width instead of a fixed count that looks sparse/cramped
// once the container shrinks.
const NOTCH_PITCH_PX = 4;

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
    const { data: creditBalance, isLoading } = useGetCreditBalanceQuery(workspaceId ?? "", {
        skip: !workspaceId,
    });

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
        <VStack w="100%" align="stretch" spacing={3}>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="textPrimary">
                Plan actuel
            </Text>
            <Card size="none" p={{ base: 4, md: 5 }}>
                <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
                    <VStack align="start" spacing={0.5}>
                        <HStack spacing={2} flexWrap="wrap">
                            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="textPrimary">
                                {data.displayName}
                            </Text>
                            <HStack bg="rgba(52,211,169,0.12)" px={2} py={0.5} borderRadius="full" spacing={1}>
                                <Box w={1.5} h={1.5} borderRadius="full" bg="iconAccent" />
                                <Text fontSize="xs" color="iconAccent" fontWeight="semibold">
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
                            {isLoading ? (
                                <>
                                    <Skeleton h="28px" w="180px" borderRadius="4px" mb={1.5} />
                                    <Skeleton h="10px" borderRadius="4px" />
                                </>
                            ) : (
                                <>
                                    <HStack align="baseline" spacing={1} mb={1.5} flexWrap="wrap">
                                        <Text fontSize="xl" fontWeight="bold" color="textPrimary">
                                            {consumed.toLocaleString("fr-FR")}{" "}
                                        </Text>
                                        <Text variant="body-md-muted">/ {total.toLocaleString("fr-FR")} consommés</Text>
                                    </HStack>
                                    <ParentSize debounceTime={10}>
                                        {({ width }) =>
                                            width > 0 ? (
                                                <Gauge
                                                    orientation="linear"
                                                    value={progress}
                                                    width={width}
                                                    linearHeight={10}
                                                    notchCornerRadius={3}
                                                    notchWidthPercent={60}
                                                    totalNotches={Math.max(20, Math.round(width / NOTCH_PITCH_PX))}
                                                    inactiveFill="var(--border)"
                                                />
                                            ) : null
                                        }
                                    </ParentSize>
                                </>
                            )}
                            <HStack justify="space-between" mt={1} flexWrap="wrap" gap={1}>
                                <Text variant="body-sm-muted">Cycle commencé le {fmt(lastMonday)}</Text>
                            </HStack>
                        </Box>
                    </VStack>
                </Stack>
            </Card>
        </VStack>
    );
};

export default PlanCard;
