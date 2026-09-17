import { Badge, Card, Divider, HStack, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { useGetDeploymentsQuery } from "services/deployment/deployment";
import { useDeploymentEnvGetter } from "hooks/deployment/useGetEnv";
import { ENV_BADGE } from "pages/Agents/Deployment/data";

interface RecentDeploymentsCardProps {
    workspaceId: string;
    agentId: string;
}

const MAX_ITEMS = 5;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export const RecentDeploymentsCard = ({ workspaceId, agentId }: RecentDeploymentsCardProps) => {
    const { data: deployments = [], isLoading } = useGetDeploymentsQuery(
        { workspaceId, agentId },
        { skip: !workspaceId || !agentId },
    );
    const getDeploymentEnv = useDeploymentEnvGetter(deployments);
    const recent = deployments.slice(0, MAX_ITEMS);

    return (
        <Stack spacing={0} h="100%">
            <Card variant="attachedTop" size="sm">
                <VStack align="flex-start" spacing={0}>
                    <Text variant="body-md-semibold">Historique des déploiements</Text>
                    <Text variant="body-xs-muted">Les dernières versions déployées de cet agent</Text>
                </VStack>
            </Card>
            <Divider borderColor="borderStrong" />
            <Card variant="attachedBottom" size="none" h="100%" display="flex" flexDirection="column">
                {isLoading ? (
                    <VStack align="stretch" spacing={2} p={4}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} h="48px" borderRadius="8px" />
                        ))}
                    </VStack>
                ) : recent.length === 0 ? (
                    <VStack justify="center" flex={1} py={10}>
                        <Text variant="body-sm-muted">Aucun déploiement pour le moment.</Text>
                    </VStack>
                ) : (
                    <VStack align="stretch" spacing={0} divider={<Divider borderColor="borderDefault" />}>
                        {recent.map((d) => {
                            const badge = ENV_BADGE[getDeploymentEnv(d)];
                            return (
                                <HStack key={d.id} justify="space-between" p={3.5} spacing={3}>
                                    <HStack spacing={2.5} minW={0}>
                                        <Text fontFamily="mono" fontWeight={600} fontSize="sm" flexShrink={0}>
                                            v{d.version}
                                        </Text>
                                        <Badge colorScheme={badge.color} fontSize="9px">
                                            {badge.label}
                                        </Badge>
                                        <Text variant="body-sm" noOfLines={1} color="textMuted">
                                            {d.name ?? d.changelog ?? "Sans description"}
                                        </Text>
                                    </HStack>
                                    <Text variant="body-xs-muted" flexShrink={0}>
                                        {formatDate(d.createdAt)}
                                    </Text>
                                </HStack>
                            );
                        })}
                    </VStack>
                )}
            </Card>
        </Stack>
    );
};

export default RecentDeploymentsCard;
