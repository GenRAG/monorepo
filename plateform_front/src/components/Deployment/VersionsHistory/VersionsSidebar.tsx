import { Box, Skeleton, Text, VStack } from "@chakra-ui/react";
import { VersionListItem } from "components/Deployment/VersionListItem";
import { ENV_BADGE } from "pages/Agents/Deployment/data";
import { useGetDeploymentsQuery } from "services/deployment/deployment";
import { useDeploymentEnvGetter } from "hooks/deployment/useGetEnv";
import { formatAbsoluteDate } from "utils/date";

interface VersionsSidebarProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
    workspaceId: string;
    agentId: string;
}

export const VersionsSidebar = ({ selectedId, onSelect, workspaceId, agentId }: VersionsSidebarProps) => {
    const {
        data: deployments = [],
        isLoading,
        isError,
    } = useGetDeploymentsQuery({
        workspaceId,
        agentId,
    });
    const getDeploymentEnv = useDeploymentEnvGetter(deployments);

    return (
        <Box
            w="320px"
            flexShrink={0}
            bg="surfacePrimary"
            borderRight="1px solid"
            borderRightColor="borderDefault"
            h="100%"
            display="flex"
            flexDirection="column"
        >
            <VStack align="stretch" spacing={0}>
                <Box borderBottom="1px solid" borderBottomColor="borderDefault" w="full" p={4}>
                    <Text fontSize="sm" color="textDescription" px={1}>
                        {deployments.length} VERSIONS
                    </Text>
                </Box>

                <VStack spacing={0} align="stretch" overflowY="auto" flex={1} maxH="calc(100vh - 200px)">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="72px" m={4} borderRadius="6px" />)
                    ) : isError ? (
                        <Text fontSize="sm" color="textError" p={4}>
                            Impossible de charger les versions.
                        </Text>
                    ) : (
                        deployments.map((d) => {
                            const env = getDeploymentEnv(d);
                            return (
                                <VersionListItem
                                    key={d.id}
                                    id={`v${d.version}`}
                                    env={env}
                                    badge={ENV_BADGE[env]}
                                    description={d.name ?? "Aucune description"}
                                    date={formatAbsoluteDate(d.createdAt)}
                                    isSelected={d.id === selectedId}
                                    onClick={() => onSelect(d.id)}
                                />
                            );
                        })
                    )}
                </VStack>
            </VStack>
        </Box>
    );
};
