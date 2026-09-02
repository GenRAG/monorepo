import { Grid, Heading, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
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
import { WorkspaceStats } from "types/workspace";

const buildTrend = (value: number, points = 20): number[] => {
    if (value === 0) return Array(points).fill(0);
    return Array.from({ length: points }, (_, i) => {
        const t = i / (points - 1);
        return value * t * t * (3 - 2 * t);
    });
};

// TEMP: visual QA for the redesigned MetricCard/ActivityChart against non-empty data.
// Same shape as WorkspaceStats — remove once the new stat cards are confirmed.
const DEBUG_USE_MOCK_STATS = true;
const MOCK_STATS: WorkspaceStats = {
    agents: { total: 5, production: 3, development: 2, items: [] },
    documents: { total: 42, indexed: 38, processing: 2, failed: 2 },
    conversations: { total: 1284, today: 37 },
    credits: 2520,
    recentActivity: [],
    activityChart: {
        "24h": {
            labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
            values: [2, 1, 1, 1, 1, 3, 5, 8, 12, 15, 18, 14, 16, 19, 13, 11, 9, 10, 14, 17, 12, 8, 5, 3],
        },
        "7j": {
            labels: ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."],
            values: [42, 58, 51, 67, 74, 39, 45],
        },
        "30j": {
            labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
            values: Array.from({ length: 30 }, (_, i) => Math.round(30 + 40 * Math.sin(i / 4) + i * 1.5)),
        },
    },
};

const Dashboard = () => {
    const { name } = useUserInfo();
    const navigate = useNavigate();
    const { workspaceId = "" } = useParams<{ workspaceId: string }>();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    const { data: realStats, isLoading: isStatsLoading } = useGetWorkspaceStatsQuery(workspaceId, {
        skip: !workspaceId,
    });
    const stats = DEBUG_USE_MOCK_STATS ? MOCK_STATS : realStats;

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
                    <Heading variant="heading-md" color="textLabel" fontWeight="md" fontSize={{ base: "sm", md: "md" }}>
                        {new Date().toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </Heading>
                    <Heading
                        variant="heading-3xl"
                        color="textPrimary"
                        fontWeight="semibold"
                        fontSize={{ base: "xl", md: "3xl" }}
                    >
                        Bonjour {name}
                    </Heading>
                    {stats ? (
                        <Text variant="body-sm-muted">
                            {`${stats.agents.total} agent${stats.agents.total > 1 ? "s" : ""} / ${stats.agents.production} en production / ${stats.documents.indexed} document${stats.documents.indexed > 1 ? "s" : ""} indexé${stats.documents.indexed > 1 ? "s" : ""}`}
                        </Text>
                    ) : (
                        <Skeleton height="17px" width="320px" maxW="80vw" borderRadius="4px" {...skeletonProps} />
                    )}
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
                    value={conversationsToday}
                    trend={`${stats?.conversations.total ?? 0} au total`}
                    trendPositive
                    sparkData={conversationsTodayArr}
                    isLoading={isStatsLoading}
                />
                <MetricCard
                    icon={Bot}
                    label="Agents en production"
                    value={agentsProd}
                    trend={`${stats?.agents.total ?? 0} agent au total`}
                    trendPositive
                    sparkData={buildTrend(agentsProd)}
                    isLoading={isStatsLoading}
                />
                <MetricCard
                    icon={FileText}
                    label="Documents indexés"
                    value={docsIndexed}
                    trend={`${stats?.documents.total ?? 0} au total`}
                    trendPositive
                    sparkData={buildTrend(docsIndexed)}
                    isLoading={isStatsLoading}
                />
                <MetricCard
                    icon={Coins}
                    label="Crédits restants"
                    value={credits}
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
