import {
    Box,
    Grid,
    Heading,
    Stack,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    BookOpen,
    FileUp,
    Plus,
    ExternalLink,
    AlertCircle,
    FileText,
    MessageSquare,
    Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserInfo } from "hooks/useUserInfo";
import { MetricCard } from "components/Dashboard/MetricCard";
import { QuickActionCard } from "components/Dashboard/QuickActionCard";
import { ActivityChart } from "components/Dashboard/ActivityChart";
import { AgentsCard } from "components/Dashboard/AgentsCard";
import { RecentActivityCard } from "components/Dashboard/RecentActivityCard";
import { SPARK_DATA } from "./data";

const Dashboard = () => {
    const { name } = useUserInfo();
    const navigate = useNavigate();

    const textPrimary = useColorModeValue("grey.900", "grey.50");
    const textSecondary = useColorModeValue("grey.500", "grey.400");

    return (
        <Stack
            p={{ base: 4, lg: 6 }}
            gap={4}
            overflow="auto"
            maxH="100vh"
            minH="100vh"
        >
            <Stack
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align={{ base: "flex-start", md: "flex-end" }}
                gap={3}
            >
                <VStack align="start" spacing={1}>
                    <Heading
                        variant="heading-md"
                        color="grey.400"
                        fontWeight="md"
                        fontSize={{ base: "sm", md: "md" }}
                    >
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
                        Voici l&apos;état de vos agents aujourd&apos;hui —{" "}
                        <Box as="span" color="orange.400" fontWeight="500">
                            1 incident en cours
                        </Box>{" "}
                        et 2 promotions à examiner.
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
                    label="Conversations / 24h"
                    value="1 248"
                    trend="+18%"
                    trendPositive
                    sparkData={SPARK_DATA.conversations}
                />
                <MetricCard
                    icon={Timer}
                    label="Latence P95"
                    value="1,4 s"
                    trend="-220ms"
                    trendPositive
                    sparkData={SPARK_DATA.latency}
                />
                <MetricCard
                    icon={AlertCircle}
                    label="Taux d'erreur"
                    value="0,4%"
                    trend="+0,1pt"
                    trendPositive={false}
                    trendNeutral
                    sparkData={SPARK_DATA.errors}
                    sparkColor="#F59E0B"
                />
                <MetricCard
                    icon={FileText}
                    label="Documents indexés"
                    value="248"
                    trend="+12 cette semaine"
                    trendPositive
                    sparkData={SPARK_DATA.documents}
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
                    onClick={() => navigate("/workspaces")}
                />
                <QuickActionCard
                    icon={FileUp}
                    title="Téléverser des docs"
                    subtitle="Vers la base de connaissance"
                />
                <QuickActionCard
                    icon={BookOpen}
                    title="Tester un agent"
                    subtitle="Ouvrir le playground"
                />
                <QuickActionCard
                    icon={ExternalLink}
                    title="Documentation API"
                    subtitle="Intégrer GenRAG dans votre app"
                />
            </Grid>

            <Grid
                templateColumns={{ base: "1fr", xl: "1fr 360px" }}
                gap={3}
                alignItems="stretch"
            >
                <VStack spacing={3} align="stretch" h="100%" minW={0}>
                    <ActivityChart />
                    <RecentActivityCard />
                </VStack>
                <VStack spacing={3} align="stretch" h="100%" minW={0}>
                    {/*<AlertsCard />*/}
                    <AgentsCard flex={1} />
                </VStack>
            </Grid>
        </Stack>
    );
};

export default Dashboard;
