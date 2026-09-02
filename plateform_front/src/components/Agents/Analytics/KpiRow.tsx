import { Grid } from "@chakra-ui/react";
import { CheckCircle2, Clock, Coins, MessageSquare } from "lucide-react";
import { MetricCard } from "components/Dashboard/MetricCard";
import { type DailyMetrics } from "./types";

interface KpiRowProps {
    rows: DailyMetrics[];
    days: number;
}

export const KpiRow = ({ rows, days }: KpiRowProps) => {
    const totalQueries = rows.reduce((s, r) => s + r.queries, 0);
    const avgLatency = Math.round(rows.reduce((s, r) => s + r.latencyP50, 0) / rows.length);
    const avgCost = +(rows.reduce((s, r) => s + r.creditsPerQuery, 0) / rows.length).toFixed(2);
    const avgSuccessRate = +(rows.reduce((s, r) => s + r.successRate, 0) / rows.length).toFixed(1);

    return (
        <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={3}>
            <MetricCard
                icon={MessageSquare}
                label="Requêtes"
                value={totalQueries}
                trend={`sur ${days} jours`}
                trendPositive
                sparkData={rows.map((r) => r.queries)}
            />
            <MetricCard
                icon={Clock}
                label="Latence moyenne (p50)"
                value={avgLatency}
                trend="millisecondes"
                trendPositive={false}
                sparkData={rows.map((r) => r.latencyP50)}
                sparkColor="#6366F1"
            />
            <MetricCard
                icon={Coins}
                label="Coût moyen / requête"
                value={avgCost}
                trend="crédits"
                trendPositive
                sparkData={rows.map((r) => r.creditsPerQuery)}
                sparkColor="#F59E0B"
            />
            <MetricCard
                icon={CheckCircle2}
                label="Taux de succès"
                value={avgSuccessRate}
                trend="% des requêtes"
                trendPositive
                sparkData={rows.map((r) => r.successRate)}
            />
        </Grid>
    );
};
