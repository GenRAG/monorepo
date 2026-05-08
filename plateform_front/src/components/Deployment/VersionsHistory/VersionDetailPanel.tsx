import { Box, useColorModeValue, VStack } from "@chakra-ui/react";
import { PipelineJsonPanel } from "components/Deployment/VersionsHistory/PipelineJsonPanel";
import { VersionHeaderActions } from "components/Deployment/VersionsHistory/VersionHeaderActions";
import { useGetDeploymentByIdQuery } from "services/deployment/deployment";

interface VersionDetailPanelProps {
    selectedId: string | null;
    workspaceId: string;
    agentId: string;
}

export const VersionDetailPanel = ({
    selectedId,
    workspaceId,
    agentId,
}: VersionDetailPanelProps) => {
    const { data: deployment } = useGetDeploymentByIdQuery(
        { workspaceId, agentId, id: selectedId! },
        { skip: !selectedId },
    );
    const bg = useColorModeValue("white", "grey.975");
    const borderColor = useColorModeValue("grey.100", "grey.800");

    return (
        <Box flex="1 1 0" p={6} bg={bg}>
            <VStack
                align="stretch"
                h="full"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="12px"
            >
                <VersionHeaderActions
                    deployment={deployment ?? null}
                    workspaceId={workspaceId}
                    agentId={agentId}
                />
                <PipelineJsonPanel
                    workflowVersion={deployment?.workflowVersion ?? null}
                    workspaceId={workspaceId}
                    agentId={agentId}
                />
            </VStack>
        </Box>
    );
};
