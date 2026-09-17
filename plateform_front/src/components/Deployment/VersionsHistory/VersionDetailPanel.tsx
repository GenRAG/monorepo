import { Box, Skeleton, Text, VStack } from "@chakra-ui/react";
import { PipelineJsonPanel } from "components/Deployment/VersionsHistory/PipelineJsonPanel";
import { VersionHeaderActions } from "components/Deployment/VersionsHistory/VersionHeaderActions";
import { useGetDeploymentByIdQuery } from "services/deployment/deployment";

interface VersionDetailPanelProps {
    selectedId: string | null;
    workspaceId: string;
    agentId: string;
}

export const VersionDetailPanel = ({ selectedId, workspaceId, agentId }: VersionDetailPanelProps) => {
    const {
        data: deployment,
        isLoading,
        isError,
    } = useGetDeploymentByIdQuery({ workspaceId, agentId, id: selectedId ?? "" }, { skip: !selectedId });

    if (isLoading) {
        return (
            <Box flex="1 1 0" p={6} bg="surfacePrimary">
                <Skeleton h="full" borderRadius="12px" startColor="skeletonStart" endColor="skeletonEnd" />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box flex="1 1 0" p={6} bg="surfacePrimary">
                <VStack
                    align="center"
                    justify="center"
                    h="full"
                    border="1px solid"
                    borderColor="borderDefault"
                    borderRadius="12px"
                >
                    <Text color="textError">Impossible de charger ce déploiement.</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box flex="1 1 0" p={6} bg="surfacePrimary">
            <VStack align="stretch" h="full" border="1px solid" borderColor="borderDefault" borderRadius="12px">
                <VersionHeaderActions deployment={deployment ?? null} workspaceId={workspaceId} agentId={agentId} />
                <PipelineJsonPanel
                    workflowVersion={deployment?.workflowVersion ?? null}
                    workspaceId={workspaceId}
                    agentId={agentId}
                    deploymentName={deployment?.name ?? null}
                    deploymentChangelog={deployment?.changelog ?? null}
                />
            </VStack>
        </Box>
    );
};
