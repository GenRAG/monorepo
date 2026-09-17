import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import Button from "components/ui/Button";
import { useDeploymentEnvGetter } from "hooks/deployment/useGetEnv";
import { useIsDark } from "hooks/useIsDark";
import useThemedToast from "hooks/useThemedToast";
import { ENV_BADGE } from "pages/Agents/Deployment/data";
import { useGetDeploymentsQuery, useRollbackDeploymentMutation } from "services/deployment/deployment";
import { AgentStatus, Deployment, VersionStatus } from "types/deployment/deployment";
import { formatAbsoluteDate } from "utils/date";

interface VersionHeaderActionsProps {
    deployment: Deployment | null;
    workspaceId: string;
    agentId: string;
}

export const VersionHeaderActions = ({ deployment, workspaceId, agentId }: VersionHeaderActionsProps) => {
    const { data: deployments = [] } = useGetDeploymentsQuery({
        workspaceId,
        agentId,
    });
    const [rollback, { isLoading }] = useRollbackDeploymentMutation();
    const getDeploymentEnv = useDeploymentEnvGetter(deployments);
    const isDark = useIsDark();
    const toast = useThemedToast();

    const buttonType = isDark ? "superPrimary" : "primary";

    if (!deployment) return <Box p={4}>Pas de déploiement en production trouvé pour cet agent.</Box>;

    const env = getDeploymentEnv(deployment);
    const badge = ENV_BADGE[env];
    const canRestore = env === VersionStatus.ARCHIVED && deployment.toStatus !== AgentStatus.DEVELOPMENT;

    const handleRollback = async () => {
        try {
            await rollback({ workspaceId, agentId, deploymentId: deployment.id }).unwrap();
            toast({
                title: "Version restaurée",
                description: "Cette version a été restaurée en production.",
                status: "success",
            });
        } catch {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la restauration de cette version.",
                status: "error",
            });
        }
    };

    return (
        <HStack justify="space-between" align="flex-start" flexWrap="wrap" p={6} gap={3}>
            <VStack align="start" spacing={1}>
                <HStack>
                    <Text fontSize="2xl" fontWeight={500} color="textStrong" fontFamily="mono" lineHeight={1}>
                        v{deployment.version}
                    </Text>
                    <Badge colorScheme={badge.color} fontSize="sm" fontWeight={500}>
                        {env === VersionStatus.PRODUCTION ? "EN PROD" : badge.label}
                    </Badge>
                </HStack>
                <Text fontSize="14px" color="textSubtle">
                    {formatAbsoluteDate(deployment.createdAt)}, deployé par{" "}
                    {deployment.createdByUser?.name ?? deployment.createdBy}
                </Text>
            </VStack>
            <HStack flexWrap="wrap">
                {canRestore && (
                    <Button size="sm" variant={buttonType} isLoading={isLoading} onClick={handleRollback}>
                        Restaurer en prod
                    </Button>
                )}
            </HStack>
        </HStack>
    );
};
