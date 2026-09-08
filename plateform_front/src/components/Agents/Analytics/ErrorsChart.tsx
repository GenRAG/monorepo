import { useMemo, useState } from "react";
import { Box, Card, Divider, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { STATUS_COLORS } from "themeNew/foundations/themeConfig";
import { Bar, BarChart, BarXAxis, ChartStatFlow, ChartTooltip, Grid, TooltipContent, YAxis } from "components/charts";
import MultiOptionButtons from "components/ui/MultiOptionButtons";
import { useGetDailyMetricsQuery } from "services/analytics/analytics";
import { ChartHoverBridge, type HoverState } from "./ChartHoverBridge";
import { ChartInfoTooltip } from "./ChartInfoTooltip";
import { PERIOD_DAYS, type Period } from "./types";
import { toShortLabel } from "@/utils/analytics/dateUtils";

interface ErrorsChartProps {
    workspaceId: string;
    agentId: string;
}

export const ErrorsChart = ({ workspaceId, agentId }: ErrorsChartProps) => {
    const [period, setPeriod] = useState<Period>("30j");
    const [hover, setHover] = useState<HoverState>({ value: null, label: null });
    const days = PERIOD_DAYS[period];
    const { data: rows = [] } = useGetDailyMetricsQuery(
        { workspaceId, agentId, days },
        { skip: !workspaceId || !agentId },
    );
    const errorRows = useMemo(
        () =>
            rows.map((r) => ({
                date: r.date,
                label: toShortLabel(r.date),
                value: r.errors + r.outOfCredits,
                errors: r.errors,
                outOfCredits: r.outOfCredits,
            })),
        [rows],
    );
    const totalErrors = rows.reduce((s, r) => s + r.errors + r.outOfCredits, 0);
    const totalOutOfCredits = rows.reduce((s, r) => s + r.outOfCredits, 0);

    return (
        <Stack spacing={0}>
            <Card size="sm" variant="attachedTop">
                <HStack spacing={2} mb={1} justify="space-between" flexWrap="wrap" rowGap={1}>
                    <VStack align="flex-start" spacing={0} flex={1} minW="180px">
                        <HStack spacing={1.5}>
                            <Text variant="body-md-semibold">Erreurs & incidents</Text>
                            <ChartInfoTooltip label="Requêtes en erreur ou refusées faute de crédits, sur la période sélectionnée." />
                        </HStack>
                        <Text variant="body-xs-muted">Vous permet de suivre les incidents sur votre agent</Text>
                    </VStack>
                    <VStack spacing={2} align="flex-end" flexShrink={0}>
                        <MultiOptionButtons
                            options={(["7j", "30j", "90j"] as Period[]).map((p) => ({ value: p, label: p }))}
                            value={period}
                            onChange={setPeriod}
                            size="sm"
                            color="surfaceSubtle"
                        />
                    </VStack>
                </HStack>
                <Box display="flex" justifyContent="space-between" gap={0}>
                    <Stack spacing={0}>
                        <ChartStatFlow
                            value={hover.value ?? totalErrors}
                            label={hover.label ?? `Total sur ${days} jours`}
                            valueClassName="text-3xl font-bold"
                            labelClassName="text-xs"
                        />
                    </Stack>
                    <HStack spacing={4} alignItems="end">
                        <HStack spacing={1.5}>
                            <Box w={2} h={2} borderRadius="full" bg={STATUS_COLORS.error} />
                            <Text fontSize="xs" color="textLabel">
                                Erreurs
                            </Text>
                        </HStack>
                        <HStack spacing={1.5}>
                            <Box w={2} h={2} borderRadius="full" bg={STATUS_COLORS.warning} />
                            <Text fontSize="xs" color="textLabel">
                                Crédits épuisés ({totalOutOfCredits})
                            </Text>
                        </HStack>
                    </HStack>
                </Box>
            </Card>
            <Divider borderColor="borderStrong" />
            <Card size="none" variant="attachedBottom" px={{ base: 5, md: 6 }} pt={{ base: 2, md: 3 }}>
                <Box h="180px" position="relative" p={0} minW={0}>
                    <Box position="absolute" p={0} inset={0}>
                        <BarChart
                            key={period}
                            data={errorRows}
                            xDataKey="label"
                            margin={{ top: 8, right: 8, bottom: 45, left: 20 }}
                            aspectRatio=""
                            className="h-full"
                        >
                            <Bar dataKey="value" fill={STATUS_COLORS.error} />
                            <Grid horizontal vertical />
                            <YAxis formatValue={(value: number) => (value === 0 ? "" : String(value))} />
                            <BarXAxis maxLabels={period === "90j" ? 4 : period === "30j" ? 10 : 7} />
                            <ChartHoverBridge onHoverChange={setHover} />
                            <ChartTooltip
                                showDatePill
                                content={({ point }) => (
                                    <TooltipContent
                                        title={point.label as string}
                                        rows={[
                                            {
                                                color: STATUS_COLORS.error,
                                                label: "Erreurs",
                                                value: point.errors as number,
                                            },
                                            {
                                                color: STATUS_COLORS.warning,
                                                label: "Crédits épuisés",
                                                value: point.outOfCredits as number,
                                            },
                                        ]}
                                    />
                                )}
                            />
                        </BarChart>
                    </Box>
                </Box>
            </Card>
        </Stack>
    );
};
