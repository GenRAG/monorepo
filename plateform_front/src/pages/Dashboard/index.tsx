import { Divider, Grid, Heading, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { BookOpen, Plus, Bot, FileText, MessageSquare, Coins } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserInfo } from "hooks/useUserInfo";
import { MetricCard } from "components/Dashboard/MetricCard";
import { QuickActionCard } from "components/Dashboard/QuickActionCard";
import { ActivityChart } from "components/Dashboard/ActivityChart";
import { AgentsCard } from "components/Dashboard/AgentsCard";
import { RecentActivityCard } from "components/Dashboard/RecentActivityCard";
import { CreateAgentModal } from "components/Agents/CreateAgentModal";
import { useMemo, useState } from "react";
import { useGetWorkspaceStatsQuery } from "services/workspace/workspace";
import { useGetWorkspaceConsumptionQuery } from "services/credit/credit";
import { STATUS_COLORS } from "themeNew/foundations/themeConfig";

const CREDITS_HISTORY_DAYS = 14;
const DEVELOPMENT_COLOR = "#6B7280";

const Dashboard = () => {
    const { name } = useUserInfo();
    const navigate = useNavigate();
    const { workspaceId = "" } = useParams<{ workspaceId: string }>();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    const { data: stats, isLoading: isStatsLoading } = useGetWorkspaceStatsQuery(workspaceId, {
        skip: !workspaceId,
    });
    const { data: consumption } = useGetWorkspaceConsumptionQuery(
        { workspaceId, days: CREDITS_HISTORY_DAYS },
        { skip: !workspaceId },
    );

    const conversationsToday = stats?.conversations.today ?? 0;
    const conversationsTodayArr = stats?.activityChart["24h"].values ?? Array(24).fill(0);
    const agentsProd = stats?.agents.production ?? 0;
    const docsIndexed = stats?.documents.indexed ?? 0;
    const credits = stats?.credits ?? 0;

    const creditBalanceArr = useMemo(() => {
        if (!consumption) return undefined;
        const { byDay } = consumption;
        return byDay.map((_, i) => {
            const consumedAfter = byDay.slice(i + 1).reduce((sum, used) => sum + used, 0);
            return credits + consumedAfter;
        });
    }, [consumption, credits]);

    const agentsComposition = [
        { label: "Production", value: stats?.agents.production ?? 0, color: STATUS_COLORS.success },
        { label: "Dev", value: stats?.agents.development ?? 0, color: DEVELOPMENT_COLOR },
    ];
    const documentsComposition = [
        { label: "Indexés", value: stats?.documents.indexed ?? 0, color: STATUS_COLORS.success },
        { label: "En cours", value: stats?.documents.processing ?? 0, color: STATUS_COLORS.warning },
        { label: "Échoués", value: stats?.documents.failed ?? 0, color: STATUS_COLORS.error },
    ];

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

            <Divider borderColor="borderSubtle" />

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
                    composition={agentsComposition}
                    isLoading={isStatsLoading}
                    defaultLabel="Agents"
                />
                <MetricCard
                    icon={Coins}
                    label="Crédits restants"
                    value={credits}
                    trend="disponibles"
                    trendPositive
                    sparkData={creditBalanceArr}
                    isLoading={isStatsLoading}
                />
                <MetricCard
                    icon={FileText}
                    label="Documents indexés"
                    value={docsIndexed}
                    trend={`${stats?.documents.total ?? 0} au total`}
                    trendPositive
                    composition={documentsComposition}
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
