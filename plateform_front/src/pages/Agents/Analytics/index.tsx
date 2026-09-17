import { useState } from "react";
import { Box, Grid, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import WorkspaceHeader from "components/ui/WorkspaceHeader";
import { useGetAgentByIdQuery } from "services/agent/agent";
import { VolumeChart } from "components/Agents/Analytics/VolumeChart";
import { LatencyChart } from "components/Agents/Analytics/LatencyChart";
import { ErrorsChart } from "components/Agents/Analytics/ErrorsChart";
import { DocumentHealthCard } from "components/Agents/Analytics/DocumentHealthCard";
import { RecentQueriesCard } from "components/Agents/Analytics/RecentQueriesCard";
import { CostChart } from "components/Agents/Analytics/CostChart";
import { CostByTypeCard } from "components/Agents/Analytics/CostByTypeCard";
import { CostByModelCard } from "components/Agents/Analytics/CostByModelCard";
import { AnalyticsTab, AnalyticsTabs } from "components/Agents/Analytics/AnalyticsTabs";
import { ActivityHeatmapCard } from "components/Agents/Analytics/ActivityHeatmapCard";

const AnalyticsWorkspace = () => {
    const { workspaceId = "", agentId = "" } = useParams<{ workspaceId: string; agentId: string }>();
    const { data: agent } = useGetAgentByIdQuery({ workspaceId, id: agentId }, { skip: !workspaceId || !agentId });

    const [activeTab, setActiveTab] = useState<AnalyticsTab>(AnalyticsTab.Overview);

    const renderContent = () => {
        switch (activeTab) {
            case AnalyticsTab.Overview:
                return (
                    <VStack w="100%" align="stretch" spacing={5}>
                        <ActivityHeatmapCard workspaceId={workspaceId} agentId={agentId} />

                        <Grid templateColumns={{ base: "1fr", xl: "3fr 2fr" }} gap={5} alignItems="stretch">
                            <VolumeChart workspaceId={workspaceId} agentId={agentId} />
                            <DocumentHealthCard workspaceId={workspaceId} agentId={agentId} />
                        </Grid>

                        <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={5} alignItems="stretch">
                            <VStack spacing={5} align="stretch">
                                <LatencyChart workspaceId={workspaceId} agentId={agentId} />
                                <ErrorsChart workspaceId={workspaceId} agentId={agentId} />
                            </VStack>

                            <RecentQueriesCard workspaceId={workspaceId} agentId={agentId} />
                        </Grid>
                    </VStack>
                );
            case AnalyticsTab.Costs:
                return (
                    <VStack w="100%" align="stretch" spacing={5}>
                        <CostChart workspaceId={workspaceId} agentId={agentId} />

                        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5} alignItems="stretch">
                            <CostByTypeCard workspaceId={workspaceId} agentId={agentId} />
                            <CostByModelCard workspaceId={workspaceId} agentId={agentId} />
                        </Grid>
                    </VStack>
                );
        }
    };

    return (
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden">
            <WorkspaceHeader
                title="Analytics"
                description={
                    agent ? `Utilisation et performance de ${agent.name}` : "Utilisation et performance de l'agent"
                }
            />

            <Box bg="surfaceAppShell" flexShrink={0}>
                <AnalyticsTabs activeTab={activeTab} onChange={setActiveTab} />
            </Box>

            <VStack
                w="100%"
                flex={1}
                align="stretch"
                spacing={5}
                overflowY="auto"
                overflowX="hidden"
                bg="secondBackgroundDefault"
                p={6}
            >
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                >
                    {renderContent()}
                </motion.div>
            </VStack>
        </VStack>
    );
};

export default AnalyticsWorkspace;
