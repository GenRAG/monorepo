import { Grid, Heading, Stack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { BookOpen, FileUp, Plus, ExternalLink, Bot, FileText, MessageSquare, Coins } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserInfo } from "hooks/useUserInfo";
import { MetricCard } from "components/Dashboard/MetricCard";
import { QuickActionCard } from "components/Dashboard/QuickActionCard";
import { ActivityChart } from "components/Dashboard/ActivityChart";
import { AgentsCard } from "components/Dashboard/AgentsCard";
import { RecentActivityCard } from "components/Dashboard/RecentActivityCard";
import { CreateAgentModal } from "pages/Agents/CreateAgentModal";
import { useState } from "react";
import { useGetWorkspaceStatsQuery } from "services/workspace/workspace";

const Dashboard = () => {
    const { name } = useUserInfo();
    const navigate = useNavigate();
    const { workspaceId = "" } = useParams<{ workspaceId: string }>();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");

    const { data: stats, isLoading: isStatsLoading } = useGetWorkspaceStatsQuery(workspaceId, { skip: !workspaceId });

    const conversationsToday = stats?.conversations.today ?? 0;
    const conversationsTodayArr = stats?.activityChart["24h"].values ?? Array(24).fill(0);
    const agentsProd = stats?.agents.production ?? 0;
    const agentsProdArr = Array(20).fill(agentsProd);
    const docsIndexed = stats?.documents.indexed ?? 0;
    const docsArr = Array(20).fill(docsIndexed);
    const credits = stats?.credits ?? 0;
    const creditsArr = Array(20).fill(credits);

    return (
        <Stack p={{ base: 4, lg: 6 }} gap={4} overflow="auto" maxH="100vh" minH="100vh">
            <Stack
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "flex-start", md: "flex-end" }}
                gap={3}
            >
                <VStack align="start" spacing={1}>
                    <Heading variant="heading-md" color="grey.400" fontWeight="md" fontSize={{ base: "sm", md: "md" }}>
                        {new Date().toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </Heading>
                    <Heading
                        variant="heading-3xl"
                        color={textPrimary}
                        fontWeight="semibold"
                        fontSize={{ base: "xl", md: "3xl" }}
                    >
                        Bonjour {name}.
                    </Heading>
                    <Text fontSize="sm" color={textSecondary}>
                        {stats
                            ? `${stats.agents.total} agent${stats.agents.total > 1 ? "s" : ""} · ${stats.agents.production} en production · ${stats.documents.indexed} document${stats.documents.indexed > 1 ? "s" : ""} indexé${stats.documents.indexed > 1 ? "s" : ""}`
                            : "Chargement de vos données…"}
                    </Text>
                </VStack>
            </Stack>

            <Grid
                templateColumns={{
                    base: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                }}
                gap={3}
            >
                <MetricCard
                    icon={MessageSquare}
                    label="Conversations aujourd'hui"
                    value={conversationsToday.toLocaleString("fr-FR")}
                    trend={`${stats?.conversations.total ?? 0} au total`}
                    trendPositive
                    sparkData={conversationsTodayArr}
                    isLoading={isStatsLoading}
                />
                <MetricCard
                    icon={Bot}
                    label="Agents en production"
                    value={String(agentsProd)}
                    trend={`${stats?.agents.total ?? 0} au total`}
                    trendPositive
                    sparkData={agentsProdArr}
                    isLoading={isStatsLoading}
                />
                <MetricCard
                    icon={FileText}
                    label="Documents indexés"
                    value={String(docsIndexed)}
                    trend={`${stats?.documents.total ?? 0} au total`}
                    trendPositive
                    sparkData={docsArr}
                    isLoading={isStatsLoading}
                />
                <MetricCard
                    icon={Coins}
                    label="Crédits restants"
                    value={credits.toLocaleString("fr-FR")}
                    trend="disponibles"
                    trendPositive
                    sparkData={creditsArr}
                    isLoading={isStatsLoading}
                />
            </Grid>

            <Grid
                templateColumns={{
                    base: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                }}
                gap={3}
            >
                <QuickActionCard
                    icon={Plus}
                    title="Nouvel agent"
                    subtitle="Partez d'un template ou d'un agent existant"
                    onClick={() => setIsCreateModalOpen(true)}
                />
                <QuickActionCard icon={FileUp} title="Téléverser des docs" subtitle="Vers la base de connaissance" />
                <QuickActionCard
                    icon={BookOpen}
                    title="Tester un agent"
                    subtitle="Ouvrir le playground"
                    onClick={() => navigate(`/workspaces/${workspaceId}/agents`)}
                />
                <QuickActionCard
                    icon={ExternalLink}
                    title="Documentation API"
                    subtitle="Intégrer GenRAG dans votre app"
                />
            </Grid>

            <Grid templateColumns={{ base: "1fr", xl: "1fr 360px" }} gap={3} alignItems="stretch">
                <VStack spacing={3} align="stretch" h="100%" minW={0}>
                    <ActivityChart
                        chartData={stats?.activityChart}
                        totalConversations={stats?.conversations.total ?? 0}
                        todayConversations={stats?.conversations.today ?? 0}
                        isLoading={isStatsLoading}
                        isEmpty={!isStatsLoading && (stats?.conversations.total ?? 0) === 0}
                    />
                    <RecentActivityCard
                        items={stats?.recentActivity}
                        isLoading={isStatsLoading}
                        isEmpty={!isStatsLoading && (stats?.recentActivity.length ?? 0) === 0}
                    />
                </VStack>
                <VStack spacing={3} align="stretch" h="100%" minW={0}>
                    <AgentsCard
                        agents={stats?.agents.items}
                        isLoading={isStatsLoading}
                        isEmpty={!isStatsLoading && (stats?.agents.total ?? 0) === 0}
                        flex={1}
                    />
                </VStack>
            </Grid>
            <CreateAgentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspaceId={workspaceId}
            />
        </Stack>
    );
};

export default Dashboard;
