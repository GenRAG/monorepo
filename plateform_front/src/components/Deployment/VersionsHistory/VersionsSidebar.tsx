import { Box, Skeleton, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { VersionListItem } from "components/Deployment/VersionListItem";
import { ENV_BADGE } from "pages/Agents/Deployment/data";
import { useGetDeploymentsQuery } from "services/deployment/deployment";
import { useDeploymentEnvGetter } from "hooks/useGetEnv";

interface VersionsSidebarProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
    workspaceId: string;
    agentId: string;
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

export const VersionsSidebar = ({ selectedId, onSelect, workspaceId, agentId }: VersionsSidebarProps) => {
    const { data: deployments = [], isLoading } = useGetDeploymentsQuery({
        workspaceId,
        agentId,
    });
    const getDeploymentEnv = useDeploymentEnvGetter(deployments);
    const bgColor = useColorModeValue("white", "grey.950");
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const textColor = useColorModeValue("grey.600", "grey.300");

    return (
        <Box
            w="320px"
            flexShrink={0}
            bg={bgColor}
            borderRight="1px solid"
            borderRightColor={borderColor}
            h="100%"
            display="flex"
            flexDirection="column"
        >
            <VStack align="stretch" spacing={0}>
                <Box borderBottom="1px solid" borderBottomColor={borderColor} w="full" p={4}>
                    <Text fontSize="sm" color={textColor} px={1}>
                        {deployments.length} VERSIONS
                    </Text>
                </Box>

                <VStack spacing={0} align="stretch" overflowY="auto" flex={1} maxH="calc(100vh - 200px)">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <Skeleton key={i} h="72px" m={4} borderRadius="6px" />
                          ))
                        : deployments.map((d) => {
                              const env = getDeploymentEnv(d);
                              return (
                                  <VersionListItem
                                      key={d.id}
                                      id={`v${d.version}`}
                                      env={env}
                                      badge={ENV_BADGE[env]}
                                      description={d.changelog ?? "Aucune description"}
                                      date={formatDate(d.createdAt)}
                                      isSelected={d.id === selectedId}
                                      onClick={() => onSelect(d.id)}
                                  />
                              );
                          })}
                </VStack>
            </VStack>
        </Box>
    );
};
