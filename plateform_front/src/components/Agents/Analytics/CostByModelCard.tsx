import { useMemo, useState } from "react";
import { Box, Card, Divider, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { BarChart2 } from "lucide-react";
import { CHART_GREEN_SHADES } from "themeNew/foundations/themeConfig";
import { Bar, BarChart, BarYAxis, ChartTooltip, TooltipContent } from "components/charts";
import MultiOptionButtons from "components/ui/MultiOptionButtons";
import { CardEmptyState } from "@/components/Dashboard/CardEmptyState";
import { useGetCostByModelQuery } from "services/analytics/analytics";
import { ChartInfoTooltip } from "./ChartInfoTooltip";
import { fmtCredits, usdToCredits } from "../../../utils/analytics/costUtils";
import { PERIOD_DAYS, type Period } from "./types";

// Most-expensive model first, most vivid shade first.
const MODEL_COLORS = [CHART_GREEN_SHADES[3], CHART_GREEN_SHADES[2], CHART_GREEN_SHADES[1], CHART_GREEN_SHADES[0]];

interface CostByModelCardProps {
    workspaceId: string;
    agentId: string;
}

export const CostByModelCard = ({ workspaceId, agentId }: CostByModelCardProps) => {
    const [period, setPeriod] = useState<Period>("30j");
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
    const barColors = modelRows.map((_, index) => MODEL_COLORS[index % MODEL_COLORS.length]);

    return (
        <Stack spacing={0}>
            <Card variant="attachedTop" size="sm">
                <HStack spacing={2} justify="space-between" flexWrap="wrap" rowGap={1}>
                    <VStack align="flex-start" spacing={0} flex={1} minW="180px">
                        <HStack spacing={1.5}>
                            <Text variant="body-md-semibold">Crédits par modèle</Text>
                            <ChartInfoTooltip label="Crédits consommés sur la période pour chaque modèle utilisé par le pipeline." />
                        </HStack>
                        <Text variant="body-xs-muted">Vous permet d&apos;identifier le modèle le plus coûteux</Text>
                    </VStack>
                    {!isEmpty && (
                        <MultiOptionButtons
                            options={(["7j", "30j", "90j"] as Period[]).map((p) => ({ value: p, label: p }))}
                            value={period}
                            onChange={setPeriod}
                            size="sm"
                            color="surfaceSubtle"
                        />
                    )}
                </HStack>
            </Card>
            <Divider borderColor="borderStrong" />
            <Card variant="attachedBottom" size="none" px={{ base: 5, md: 6 }} pt={{ base: 4, md: 5 }} pb={4}>
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
                                data={modelRows}
                                xDataKey="name"
                                orientation="horizontal"
                                margin={{ top: 0, right: 60, bottom: 0, left: 170 }}
                                aspectRatio=""
                                className="h-full"
                            >
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
                                                        color: barColors[index] ?? MODEL_COLORS[0],
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
            </Card>
        </Stack>
    );
};
