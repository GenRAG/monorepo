import { Box, Card, Divider, HStack, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { Gauge } from "components/charts";
import { PatternLines } from "components/charts/visx-pattern";
import { useGetCreditBalanceQuery } from "services/credit/credit";

interface CreditSummaryCardProps {
    workspaceId: string;
}

export const CreditSummaryCard = ({ workspaceId }: CreditSummaryCardProps) => {
    const { data, isLoading, isError } = useGetCreditBalanceQuery(workspaceId, { skip: !workspaceId });
    const balance = data?.balance ?? 0;
    const totalGranted = data?.totalGranted ?? 0;
    const usedRatio = totalGranted > 0 ? Math.min(1, Math.max(0, 1 - balance / totalGranted)) : 0;

    return (
        <Stack spacing={0} h="100%">
            <Card variant="attachedTop" size="sm">
                <HStack align="flex-start" justify="space-between">
                    <VStack align="flex-start" spacing={0}>
                        <Text variant="body-md-semibold">Crédits du workspace</Text>
                        <Text variant="body-xs-muted">Solde disponible pour l&apos;ensemble de vos agents</Text>
                    </VStack>
                </HStack>
            </Card>
            <Divider borderColor="borderStrong" />
            <Card variant="attachedBottom" size="none" p={4} flex={1}>
                {isLoading ? (
                    <Skeleton h="72px" borderRadius="8px" />
                ) : isError ? (
                    <VStack align="center" justify="center" h="72px">
                        <Text variant="body-sm-muted">Impossible de charger le solde de crédits.</Text>
                    </VStack>
                ) : (
                    <VStack align="stretch" spacing={4}>
                        {!isLoading && !isError && (
                            <Text variant="body-md" whiteSpace="nowrap">
                                {totalGranted.toLocaleString("fr-FR")} crédits alloués
                            </Text>
                        )}
                        <Box maxW="280px" mx="auto" w="100%">
                            <Gauge
                                activeFill="url(#gauge-credit-fg)"
                                centerValue={balance}
                                defaultLabel="crédits restants"
                                endAngle={400}
                                formatOptions={{ maximumFractionDigits: 0 }}
                                inactiveFill="var(--chart-tooltip-foreground)"
                                inactiveFillOpacity={0.4}
                                notchCornerRadius={7}
                                spacing={0}
                                startAngle={140}
                                value={usedRatio * 100}
                            >
                                <PatternLines
                                    height={6}
                                    id="gauge-credit-fg"
                                    orientation={["diagonal"]}
                                    stroke="var(--chart-1)"
                                    strokeWidth={1}
                                    width={6}
                                />
                            </Gauge>
                        </Box>
                    </VStack>
                )}
            </Card>
        </Stack>
    );
};

export default CreditSummaryCard;
