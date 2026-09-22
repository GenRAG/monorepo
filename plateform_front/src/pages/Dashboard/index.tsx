import { Grid, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { BookOpen, Plus, Bot, FileText, MessageSquare, Coins } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserInfo } from "hooks/useUserInfo";
import { MetricCard } from "components/Dashboard/MetricCard";
import { QuickActionCard } from "components/Dashboard/QuickActionCard";
import { ActivityChart } from "components/Dashboard/ActivityChart";
import { AgentsTable } from "components/Agents/AgentsTable";
import { RecentActivityCard } from "components/Dashboard/RecentActivityCard";
import { CreateAgentModal } from "components/Agents/CreateAgentModal";
import { MainLayoutContainer } from "components/ui/MainLayoutContainer";
import { DashboardHeader } from "pages/Dashboard/DashboardHeader";
import { useMemo, useState } from "react";
import { useGetWorkspaceStatsQuery } from "services/workspace/workspace";
import { useGetWorkspaceConsumptionQuery } from "services/credit/credit";
import { useGetWorkspaceAgentsQuery } from "services/agent/agent";
import { STATUS_COLORS } from "themeNew/foundations/themeConfig";

const AGENTS_SKELETON_ROWS = 4;

// Assez large pour couvrir 4 mois calendaires complets même en fin de mois (4×31 + marge).
const CREDITS_HISTORY_DAYS = 130;
const DEVELOPMENT_COLOR = "#6B7280";
const MONTH_LABELS = [
    "janv.",
    "févr.",
    "mars",
    "avr.",
    "mai",
    "juin",
    "juil.",
    "août",
    "sept.",
    "oct.",
    "nov.",
    "déc.",
];

const Dashboard = () => {
    const { name } = useUserInfo();
    const navigate = useNavigate();
    const { workspaceId = "" } = useParams<{ workspaceId: string }>();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: stats, isLoading: isStatsLoading } = useGetWorkspaceStatsQuery(workspaceId, {
        skip: !workspaceId,
    });
    const { data: consumption } = useGetWorkspaceConsumptionQuery(
        { workspaceId, days: CREDITS_HISTORY_DAYS },
        { skip: !workspaceId },
    );
    const { data: agents = [], isLoading: isAgentsLoading } = useGetWorkspaceAgentsQuery(workspaceId, {
        skip: !workspaceId,
    });

    const conversationsToday = stats?.conversations.today ?? 0;
    const conversationsTodayArr = stats?.activityChart["24h"].values ?? Array(24).fill(0);
    const agentsProd = stats?.agents.production ?? 0;
    const docsIndexed = stats?.documents.indexed ?? 0;

    const creditsByMonth = useMemo(() => {
        if (!consumption) return undefined;
        const { byDay } = consumption;
        const today = new Date();
        const buckets = new Map<number, { label: string; value: number }>();

        byDay.forEach((used, i) => {
            const daysAgo = byDay.length - 1 - i;
            const date = new Date(today);
            date.setDate(date.getDate() - daysAgo);
            const key = date.getFullYear() * 12 + date.getMonth();
            const existing = buckets.get(key);
            if (existing) existing.value += used;
            else buckets.set(key, { label: MONTH_LABELS[date.getMonth()], value: used });
        });

        return [...buckets.entries()]
            .sort(([a], [b]) => a - b)
            .slice(-4)
            .map(([, bucket]) => bucket);
    }, [consumption]);

    const creditsUsedLast4Months = creditsByMonth?.reduce((sum, month) => sum + month.value, 0) ?? 0;

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
        <MainLayoutContainer
            header={<DashboardHeader name={name} stats={stats} />}
            body={
                <>
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
                            label="Crédits utilisés"
                            value={creditsUsedLast4Months}
                            trend="sur les 4 derniers mois"
                            trendPositive
                            barData={creditsByMonth}
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

                    <Stack direction={{ base: "column", xl: "row" }} spacing={3} align="stretch">
                        <VStack spacing={3} align="stretch" minW={0} flex={2}>
                            <ActivityChart
                                chartData={stats?.activityChart}
                                totalConversations={stats?.conversations.total ?? 0}
                                todayConversations={stats?.conversations.today ?? 0}
                                isLoading={isStatsLoading}
                                isEmpty={!isStatsLoading && (stats?.conversations.total ?? 0) === 0}
                            />
                        </VStack>
                        <VStack spacing={2} align="stretch" minW={0} flex={1}>
                            <Text fontSize="lg" fontWeight="700" color="textPrimary" my={3}>
                                Activité récente
                            </Text>
                            <RecentActivityCard
                                items={stats?.recentActivity}
                                isLoading={isStatsLoading}
                                isEmpty={!isStatsLoading && (stats?.recentActivity.length ?? 0) === 0}
                            />
                        </VStack>
                    </Stack>
                    <VStack align="stretch" spacing={2}>
                        <Text fontSize="lg" fontWeight="700" color="textPrimary" my={3}>
                            Liste des Agents
                        </Text>
                        {isAgentsLoading ? (
                            <Stack spacing={2}>
                                {Array.from({ length: AGENTS_SKELETON_ROWS }).map((_, i) => (
                                    <Skeleton key={i} h="64px" borderRadius="12px" />
                                ))}
                            </Stack>
                        ) : (
                            <AgentsTable
                                agents={agents}
                                groupByStatus
                                workspaceId={workspaceId}
                                hasAnyAgent={agents.length > 0}
                                isSearching={false}
                                onCreateAgent={() => setIsCreateModalOpen(true)}
                            />
                        )}
                    </VStack>
                    <CreateAgentModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        workspaceId={workspaceId}
                    />
                </>
            }
        />
    );
};

export default Dashboard;
