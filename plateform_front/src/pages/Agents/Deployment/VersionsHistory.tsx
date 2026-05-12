import { useEffect, useState } from "react";
import { HStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { VersionsSidebar } from "components/Deployment/VersionsHistory/VersionsSidebar";
import { VersionDetailPanel } from "components/Deployment/VersionsHistory/VersionDetailPanel";
import { useGetDeploymentsQuery } from "services/deployment/deployment";

export const VersionsHistory = () => {
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const { data: deployments } = useGetDeploymentsQuery({
        workspaceId,
        agentId,
    });
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (deployments && deployments.length > 0 && !selectedId) {
            setSelectedId(deployments[0].id);
        }
    }, [deployments, selectedId]);

    return (
        <HStack
            align="stretch"
            h="100%"
            spacing={0}
            flex={1}
            w="100%"
            minW={0}
            overflow="hidden"
        >
            <VersionsSidebar
                selectedId={selectedId}
                onSelect={setSelectedId}
                workspaceId={workspaceId}
                agentId={agentId}
            />
            <VersionDetailPanel
                selectedId={selectedId}
                workspaceId={workspaceId}
                agentId={agentId}
            />
        </HStack>
    );
};
