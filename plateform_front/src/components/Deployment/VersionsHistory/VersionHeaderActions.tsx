import {
    Badge,
    Box,
    HStack,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import Button from "components/System/Atoms/Button";
import { useDeploymentEnvGetter } from "hooks/useGetEnv";
import { useIsDark } from "hooks/useIsDark";
import { ENV_BADGE } from "pages/Agents/Deployment/data";
import {
    useGetDeploymentsQuery,
    useRollbackDeploymentMutation,
} from "services/deployment/deployment";
import {
    AgentStatus,
    Deployment,
    VersionStatus,
} from "types/deployment/deployment";

interface VersionHeaderActionsProps {
    deployment: Deployment | null;
    workspaceId: string;
    agentId: string;
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

export const VersionHeaderActions = ({
    deployment,
    workspaceId,
    agentId,
}: VersionHeaderActionsProps) => {
    const { data: deployments = [] } = useGetDeploymentsQuery({
        workspaceId,
        agentId,
    });
    const [rollback, { isLoading }] = useRollbackDeploymentMutation();
    const getDeploymentEnv = useDeploymentEnvGetter(deployments);
    const isDark = useIsDark();

    const textColor = useColorModeValue("grey.900", "grey.50");
    const dateColor = useColorModeValue("grey.300", "grey.500");
    const buttonType = isDark ? "superPrimary" : "primary";

    if (!deployment)
        return (
            <Box p={4}>
                Pas de déploiement en production trouvé pour cet agent.
            </Box>
        );

    const env = getDeploymentEnv(deployment);
    const badge = ENV_BADGE[env];
    const canRestore =
        env === VersionStatus.ARCHIVED &&
        deployment.toStatus !== AgentStatus.DEVELOPMENT;

    return (
        <HStack
            justify="space-between"
            align="flex-start"
            flexWrap="wrap"
            p={6}
            gap={3}
        >
            <VStack align="start" spacing={1}>
                <HStack>
                    <Text
                        fontSize="2xl"
                        fontWeight={500}
                        color={textColor}
                        fontFamily="mono"
                        lineHeight={1}
                    >
                        v{deployment.version}
                    </Text>
                    <Badge
                        colorScheme={badge.color}
                        fontSize="sm"
                        fontWeight={500}
                    >
                        {env === VersionStatus.PRODUCTION
                            ? "EN PROD"
                            : badge.label}
                    </Badge>
                </HStack>
                <Text fontSize="14px" color={dateColor}>
                    {formatDate(deployment.createdAt)} · par{" "}
                    {deployment.createdByUser?.name ?? deployment.createdBy}
                </Text>
            </VStack>
            <HStack flexWrap="wrap">
                <Button size="sm" variant="outline">
                    Comparer
                </Button>
                <Button size="sm" variant="outline">
                    Dupliquer
                </Button>
                {canRestore && (
                    <Button
                        size="sm"
                        variant={buttonType}
                        isLoading={isLoading}
                        onClick={() =>
                            rollback({
                                workspaceId,
                                agentId,
                                deploymentId: deployment.id,
                            })
                        }
                    >
                        Restaurer en prod
                    </Button>
                )}
            </HStack>
        </HStack>
    );
};
