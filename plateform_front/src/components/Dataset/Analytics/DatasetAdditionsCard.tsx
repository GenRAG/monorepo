import { useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import { STATUS_COLORS } from "themeNew/foundations/themeConfig";
import { Area, AreaChart, ChartStatFlow, ChartTooltip, Grid, TooltipContent, XAxis, YAxis } from "components/charts";
import { AnalyticsChartCard } from "components/Agents/Analytics/AnalyticsChartCard";
import { PERIOD_DAYS, type Period } from "components/Agents/Analytics/types";
import { ChartHoverBridge, type HoverState } from "components/ui/ChartHoverBridge";
import { DatasetDailyAdditions } from "types/dataset/dataset";
import { toShortLabel } from "utils/analytics/dateUtils";
import { formatFileSize } from "utils/documentFormatters";

interface DatasetAdditionsCardProps {
    additions: DatasetDailyAdditions[];
    period: Period;
    onPeriodChange: (period: Period) => void;
    isFetching: boolean;
}

export const DatasetAdditionsCard = ({ additions, period, onPeriodChange, isFetching }: DatasetAdditionsCardProps) => {
    const [hover, setHover] = useState<HoverState>({ value: null, label: null });
    const rows = useMemo(
        () => additions.map((a) => ({ date: a.date, value: a.count, size: a.size, label: toShortLabel(a.date) })),
        [additions],
    );
    const total = additions.reduce((sum, a) => sum + a.count, 0);

    return (
        <AnalyticsChartCard
            title="Documents ajoutés"
            tooltip="Nombre de documents importés dans la base, par jour, sur la période sélectionnée."
            subtitle="Suivez l'alimentation de votre base dans le temps"
            period={period}
            onPeriodChange={onPeriodChange}
            headerExtra={
                <Box display="flex" flexDirection="column">
                    <ChartStatFlow
                        value={hover.value ?? total}
                        label={hover.label ?? `Ajoutés sur ${PERIOD_DAYS[period]} jours`}
                        valueClassName="text-3xl font-bold"
                        labelClassName="text-xs -mt-1"
                    />
                </Box>
            }
            contentCardProps={{ px: { base: 5, md: 6 }, pt: { base: 2, md: 3 } }}
        >
            <Box h="220px" position="relative" minW={0}>
                <Box position="absolute" inset={0}>
                    <AreaChart
                        key={period}
                        status={isFetching ? "loading" : "ready"}
                        data={rows}
                        margin={{ top: 8, right: 8, bottom: 40, left: 20 }}
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
                            loadingStyle="sweep"
                            showHighlight
                            loadingStroke={STATUS_COLORS.success}
                        />
                        <Grid horizontal vertical />
                        <YAxis formatValue={(value: number) => (value === 0 ? "" : String(value))} />
                        <XAxis />
                        <ChartTooltip
                            showDatePill
                            content={({ point }) => {
                                const { label, value, size } = point as unknown as (typeof rows)[number];
                                return (
                                    <TooltipContent
                                        title={label}
                                        rows={[
                                            { color: STATUS_COLORS.success, label: "Documents", value },
                                            { color: "transparent", label: "Taille", value: formatFileSize(size) },
                                        ]}
                                    />
                                );
                            }}
                        />
                    </AreaChart>
                </Box>
            </Box>
        </AnalyticsChartCard>
    );
};
