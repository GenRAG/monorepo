import { Box, Grid, Skeleton, VStack } from "@chakra-ui/react";
import { Cloud, TriangleAlert } from "lucide-react";
import HeaderCard from "components/Deployment/DashboardTab/HeaderCard/HeaderCard";
import { RecentDeploymentsCard } from "components/Deployment/DashboardTab/RecentDeploymentsCard";
import { CreditSummaryCard } from "components/Deployment/DashboardTab/CreditSummaryCard";
import { QuickLinksCard } from "components/Deployment/DashboardTab/QuickLinksCard";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { DocumentHealthCard } from "components/Agents/Analytics/DocumentHealthCard";
import { useGetCurrentDeploymentQuery } from "services/deployment/deployment";
import { useParams } from "react-router-dom";

export const DashboardTab = () => {
    const { workspaceId = "", agentId = "" } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

    const { data, isLoading, isError, error } = useGetCurrentDeploymentQuery({
        workspaceId,
        agentId,
    });

    if (isLoading) {
        return <Skeleton m={6} height="200px" width="100%" borderRadius="12px" mb={6} />;
    }

    if (isError || !data) {
        const isNotDeployed = typeof error === "object" && error !== null && "status" in error && error.status === 404;
        return (
            <Box p={6}>
                <CardEmptyState
                    icon={isNotDeployed ? Cloud : TriangleAlert}
                    title={isNotDeployed ? "Agent pas encore déployé" : "Erreur de chargement"}
                    description={
                        isNotDeployed
                            ? "Déployez cet agent en production pour voir son tableau de bord."
                            : "Impossible de charger les informations de déploiement. Réessayez plus tard."
                    }
                />
            </Box>
        );
    }

    return (
        <Box flex={1} overflowY="auto" p={6}>
            <VStack spacing={5} align="stretch">
                <HeaderCard data={data} isLoading={isLoading} />

                <Grid h="100%" templateColumns={{ base: "1fr", xl: "3fr 2fr" }} gap={5}>
                    <RecentDeploymentsCard workspaceId={workspaceId} agentId={agentId} />
                    <DocumentHealthCard workspaceId={workspaceId} agentId={agentId} />
                </Grid>

                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5} alignItems="stretch">
                    <CreditSummaryCard workspaceId={workspaceId} />
                    <QuickLinksCard workspaceId={workspaceId} agentId={agentId} />
                </Grid>
            </VStack>
        </Box>
    );
};
