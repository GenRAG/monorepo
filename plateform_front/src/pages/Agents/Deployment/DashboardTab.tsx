import { Box, Skeleton, useColorModeValue, VStack } from "@chakra-ui/react";
import DistributionSection from "components/Deployment/DashboardTab/DistributionSection";
import HeaderCard from "components/Deployment/DashboardTab/HeaderCard/HeaderCard";
import HealthSection from "components/Deployment/DashboardTab/HealthSection";
import { useGetCurrentDeploymentQuery } from "services/deployment/deployment";
import { useParams } from "react-router-dom";
import { AgentStatus } from "types/deployment/deployment";

export const DashboardTab = () => {
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const { data, isLoading } = useGetCurrentDeploymentQuery({
        workspaceId,
        agentId,
    });

    const bgColor = useColorModeValue("white", "grey.975");

    if (isLoading || !data) {
        return (
            <Skeleton height="200px" width="100%" borderRadius="12px" mb={6} />
        );
    }

    return (
        <Box flex={1} overflowY="auto" p={6} bg={bgColor}>
            <VStack spacing={5} align="stretch">
                <HeaderCard data={data} isLoading={isLoading} />
                {data.deploymentStatus === AgentStatus.PRODUCTION && (
                    <>
                        <HealthSection />
                        {/* <ChangesSection /> */}
                        <DistributionSection />
                    </>
                )}
            </VStack>
        </Box>
    );
};
