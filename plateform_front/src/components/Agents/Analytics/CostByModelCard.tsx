import { useId, useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import { BarChart2 } from "lucide-react";
import { CHART_GREEN_SHADES } from "themeNew/foundations/themeConfig";
import { Bar, BarChart, BarYAxis, ChartTooltip, TooltipContent } from "components/charts";
import { PatternLines } from "components/charts/visx-pattern";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { useGetCostByModelQuery } from "services/analytics/analytics";
import { AnalyticsChartCard } from "./AnalyticsChartCard";
import { fmtCredits, usdToCredits } from "../../../utils/analytics/costUtils";
import { PERIOD_DAYS, type Period } from "./types";

// Most-expensive model first, most vivid shade first.
const MODEL_COLORS = [CHART_GREEN_SHADES[3], CHART_GREEN_SHADES[2], CHART_GREEN_SHADES[1], CHART_GREEN_SHADES[0]];

const colorForIndex = (index: number) => MODEL_COLORS[index % MODEL_COLORS.length];
// Même convention que la pie chart (CostByTypeCard) : le modèle le plus coûteux (index 0) en
// couleur pleine, tous les autres en motif hachuré — reste distinguable même quand la couleur de
// base se répète au-delà de la palette (4 teintes).
const isPatternedIndex = (index: number) => index > 0;

interface CostByModelCardProps {
    workspaceId: string;
    agentId: string;
}

export const CostByModelCard = ({ workspaceId, agentId }: CostByModelCardProps) => {
    const [period, setPeriod] = useState<Period>("30j");
    const patternIdBase = `cost-by-model-pattern-${useId()}`;
    const { data: entries = [], isLoading } = useGetCostByModelQuery(
        { workspaceId, agentId, days: PERIOD_DAYS[period] },
        { skip: !workspaceId || !agentId },
    );
    const isEmpty = !isLoading && entries.length === 0;
    const modelRows = useMemo(
        () =>
            [...entries]
                .sort((a, b) => b.costUsd - a.costUsd)
                .map((entry) => ({ name: entry.key, value: usdToCredits(entry.costUsd) })),
        [entries],
    );
    // Couleur "pleine" pour le point du tooltip (toujours résolue même sur une barre patternée,
    // où `barColors` contient une référence `url(#...)` inutilisable comme background-color CSS).
    const dotColors = modelRows.map((_, index) => colorForIndex(index));
    const barColors = modelRows.map((_, index) =>
        isPatternedIndex(index) ? `url(#${patternIdBase}-${index})` : colorForIndex(index),
    );

    return (
        <AnalyticsChartCard
            title="Crédits par modèle"
            tooltip="Crédits consommés sur la période pour chaque modèle utilisé par le pipeline."
            subtitle="Vous permet d'identifier le modèle le plus coûteux"
            period={period}
            onPeriodChange={setPeriod}
            showPeriodSelector={!isEmpty}
            contentCardProps={{ px: { base: 5, md: 6 }, pt: { base: 4, md: 5 }, pb: 4 }}
        >
            <Box h="220px" position="relative" minW={0} display="flex" flexDirection="column">
                {isEmpty ? (
                    <CardEmptyState
                        icon={BarChart2}
                        title="Aucune consommation"
                        description="Les crédits consommés par modèle apparaîtront ici une fois des requêtes exécutées."
                    />
                ) : (
                    <Box position="absolute" inset={0}>
                        <BarChart
                            status={isLoading ? "loading" : "ready"}
                            data={modelRows}
                            xDataKey="name"
                            orientation="horizontal"
                            margin={{ top: 0, right: 60, bottom: 0, left: 170 }}
                            aspectRatio=""
                            className="h-full"
                        >
                            {modelRows.map((_, index) =>
                                isPatternedIndex(index) ? (
                                    <PatternLines
                                        key={`pattern-${index}`}
                                        height={6}
                                        id={`${patternIdBase}-${index}`}
                                        orientation={["diagonal"]}
                                        stroke={colorForIndex(index)}
                                        width={6}
                                    />
                                ) : null,
                            )}
                            <Bar dataKey="value" colors={barColors} fill={MODEL_COLORS[0]} />
                            <BarYAxis maxLabelWidth={150} />
                            <ChartTooltip
                                showDatePill={false}
                                content={({ point }) => {
                                    const { name, value } = point as unknown as (typeof modelRows)[number];
                                    const index = modelRows.findIndex((row) => row.name === name);
                                    return (
                                        <TooltipContent
                                            title={name}
                                            rows={[
                                                {
                                                    color: dotColors[index] ?? MODEL_COLORS[0],
                                                    label: "Crédits",
                                                    value: fmtCredits(value),
                                                },
                                            ]}
                                        />
                                    );
                                }}
                            />
                        </BarChart>
                    </Box>
                )}
            </Box>
        </AnalyticsChartCard>
    );
};
