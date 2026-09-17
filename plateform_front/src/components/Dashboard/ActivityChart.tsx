import { Box, Card, Skeleton } from "@chakra-ui/react";
import { BarChart2 } from "lucide-react";
import { useMemo, useState } from "react";
import { type Period } from "pages/Dashboard/data";
import { STATUS_COLORS } from "themeNew/foundations/themeConfig";
import { ActivityHeader } from "components/Dashboard/ActivityChart/ActivityHeader";
import { ActivityLegend } from "components/Dashboard/ActivityChart/ActivityLegend";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { WorkspaceStats } from "types/workspace";
import { Area, AreaChart, ChartStatFlow, ChartTooltip, TooltipContent } from "components/charts";
import { ChartHoverBridge, type HoverState } from "components/ui/ChartHoverBridge";

/** AreaChart is time-scaled — the x-axis is hidden here, so evenly-spaced
 * placeholder dates only drive point spacing, never displayed to the user. */
const toChartRows = (labels: string[], values: number[]) =>
    labels.map((label, i) => ({ date: new Date(2020, 0, 1 + i), value: values[i] ?? 0, label }));

interface ActivityChartProps {
    chartData?: WorkspaceStats["activityChart"];
    totalConversations?: number;
    todayConversations?: number;
    isEmpty?: boolean;
    isLoading?: boolean;
}

export const ActivityChart = ({
    chartData,
    totalConversations = 0,
    todayConversations = 0,
    isEmpty = false,
    isLoading = false,
}: ActivityChartProps) => {
    const [period, setPeriod] = useState<Period>("7j");
    const [hover, setHover] = useState<HoverState>({ value: null, label: null });

    const periodData = chartData?.[period] ?? { labels: [], values: [] };
    const { labels, values } = periodData;

    const defaultValue = period === "24h" ? todayConversations : totalConversations;
    const defaultLabel = period === "24h" ? "Aujourd'hui" : "Total";

    const chartRows = useMemo(() => toChartRows(labels, values), [labels, values]);

    return (
        <Card size="none" overflow="hidden" minW={0} h="100%" display="flex" flexDirection="column">
            <ActivityHeader period={period} setPeriod={setPeriod} />

            {isEmpty && !isLoading ? (
                <CardEmptyState
                    icon={BarChart2}
                    title="Aucune conversation"
                    description="Les métriques d'activité apparaîtront une fois vos agents en production."
                />
            ) : (
                <>
                    <Box px={4} mt={3} pb={2} display="flex" flexDirection="column">
                        {isLoading ? (
                            <Skeleton
                                startColor="skeletonStart"
                                endColor="skeletonEnd"
                                h="28px"
                                w="80px"
                                borderRadius="6px"
                            />
                        ) : (
                            <ChartStatFlow
                                value={hover.value ?? defaultValue}
                                label={hover.label ?? defaultLabel}
                                valueClassName="text-3xl font-bold"
                                labelClassName="text-xs"
                            />
                        )}
                    </Box>
                    <Box flex={1} minH="200px" position="relative" minW={0}>
                        <Box position="absolute" inset={0}>
                            <AreaChart
                                key={period}
                                status={isLoading ? "loading" : "ready"}
                                loadingLabel="Chargement..."
                                data={chartRows}
                                margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
                                aspectRatio=""
                                className="h-full"
                            >
                                <ChartHoverBridge onHoverChange={setHover} />
                                <Area
                                    dataKey="value"
                                    stroke={STATUS_COLORS.success}
                                    fill={STATUS_COLORS.success}
                                    fillOpacity={0.28}
                                    strokeWidth={2}
                                    showHighlight
                                    loadingStroke={STATUS_COLORS.success}
                                />
                                <ChartTooltip
                                    showDatePill={false}
                                    content={({ point }) => (
                                        <TooltipContent
                                            title={point.label as string}
                                            rows={[
                                                {
                                                    color: STATUS_COLORS.success,
                                                    label: "Conversations",
                                                    value: point.value as number,
                                                },
                                            ]}
                                        />
                                    )}
                                />
                            </AreaChart>
                        </Box>
                    </Box>
                    <ActivityLegend />
                </>
            )}
        </Card>
    );
};
