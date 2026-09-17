import { Box, Card, Divider, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
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
                <VStack align="flex-start" spacing={0}>
                    <Text variant="body-md-semibold">Crédits du workspace</Text>
                    <Text variant="body-xs-muted">Solde disponible pour l&apos;ensemble de vos agents</Text>
                </VStack>
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
                        <VStack align="baseline" spacing={0}>
                            <Text fontSize="2xl" fontWeight="700" color="textStrong">
                                {balance.toLocaleString("fr-FR")}
                            </Text>
                            <Text variant="body-xs-muted">
                                / {totalGranted.toLocaleString("fr-FR")} crédits alloués
                            </Text>
                        </VStack>
                        <Box h="16px" borderRadius="12px" bg="surfaceSubtle" overflow="hidden">
                            <Box h="100%" borderRadius="12px" bg="iconAccent" w={`${usedRatio * 100}%`} />
                        </Box>
                    </VStack>
                )}
            </Card>
        </Stack>
    );
};

export default CreditSummaryCard;
