import { Grid, Heading, Stack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { BookOpen, Plus, Bot, FileText, MessageSquare, Coins } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserInfo } from "hooks/useUserInfo";
import { MetricCard } from "components/Dashboard/MetricCard";
import { QuickActionCard } from "components/Dashboard/QuickActionCard";
import { ActivityChart } from "components/Dashboard/ActivityChart";
import { AgentsCard } from "components/Dashboard/AgentsCard";
import { RecentActivityCard } from "components/Dashboard/RecentActivityCard";
import { CreateAgentModal } from "components/Agents/CreateAgentModal";
import { useState } from "react";
import { useGetWorkspaceStatsQuery } from "services/workspace/workspace";

const buildTrend = (value: number, points = 20): number[] => {
    if (value === 0) return Array(points).fill(0);
    return Array.from({ length: points }, (_, i) => {
        const t = i / (points - 1);
        return value * t * t * (3 - 2 * t);
    });
};

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
    const docsIndexed = stats?.documents.indexed ?? 0;
    const credits = stats?.credits ?? 0;

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
                        Bonjour {name}
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
                    trend={`${stats?.agents.total ?? 0} agent au total`}
                    trendPositive
                    sparkData={buildTrend(agentsProd)}
                    isLoading={isStatsLoading}
                />
                <MetricCard
                    icon={FileText}
                    label="Documents indexés"
                    value={String(docsIndexed)}
                    trend={`${stats?.documents.total ?? 0} au total`}
                    trendPositive
                    sparkData={buildTrend(docsIndexed)}
                    isLoading={isStatsLoading}
                />
                <MetricCard
                    icon={Coins}
                    label="Crédits restants"
                    value={credits.toLocaleString("fr-FR")}
                    trend="disponibles"
                    trendPositive
                    sparkData={buildTrend(credits, 24)}
                    isLoading={isStatsLoading}
                />
            </Grid>

            <Grid
                templateColumns={{
                    base: "repeat(2, 1fr)",
                    lg: "repeat(2, 1fr)",
                }}
                gap={3}
            >
                <QuickActionCard
                    icon={Plus}
                    title="Nouvel agent"
                    subtitle="Partez d'un template ou d'un agent existant"
                    onClick={() => {
                        setIsCreateModalOpen(true);
                    }}
                />
                <QuickActionCard
                    icon={BookOpen}
                    title="Tester un agent"
                    subtitle="Ouvrir le playground"
                    onClick={() => navigate(`/workspaces/${workspaceId}/agents`)}
                />
            </Grid>

            <Grid templateColumns={{ base: "1fr", xl: "1fr 360px" }} gap={3} alignItems="stretch">
                <VStack spacing={3} align="stretch" h="100%" minW={0} w="100%">
                    <ActivityChart
                        chartData={stats?.activityChart}
                        totalConversations={stats?.conversations.total ?? 0}
                        todayConversations={stats?.conversations.today ?? 0}
                        isLoading={isStatsLoading}
                        isEmpty={!isStatsLoading && (stats?.conversations.total ?? 0) === 0}
                    />
                </VStack>
                <VStack spacing={3} align="stretch" h="100%" minW={0}>
                    <RecentActivityCard
                        items={stats?.recentActivity}
                        isLoading={isStatsLoading}
                        isEmpty={!isStatsLoading && (stats?.recentActivity.length ?? 0) === 0}
                    />
                </VStack>
            </Grid>
            <AgentsCard
                agents={stats?.agents.items}
                isLoading={isStatsLoading}
                isEmpty={!isStatsLoading && (stats?.agents.total ?? 0) === 0}
                flex={1}
            />
            <CreateAgentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspaceId={workspaceId}
            />
        </Stack>
    );
};

export default Dashboard;
