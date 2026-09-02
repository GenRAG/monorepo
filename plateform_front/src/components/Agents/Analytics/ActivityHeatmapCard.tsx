import { Box, Card, Divider, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import {
    HEATMAP_DEFAULT_LEVEL_STYLES,
    HeatmapCells,
    HeatmapChart,
    HeatmapInteractionBoundary,
    HeatmapInteractionProvider,
    HeatmapLegend,
    HeatmapSeparator,
    HeatmapTooltip,
    HeatmapXAxis,
    HeatmapYAxis,
    type HeatmapLevelStyles,
} from "components/charts";
import { heatmapData } from "./mockData";
import { ChartInfoTooltip } from "./ChartInfoTooltip";

// Diagonal pattern on the two least-active levels, to fade out the quiet days.
const HEATMAP_LEVEL_STYLES: HeatmapLevelStyles = [
    {
        ...HEATMAP_DEFAULT_LEVEL_STYLES[0],
        fillMode: "pattern",
        pattern: "diagonal",
        patternColor: "var(--chart-scale-pattern-color)",
        patternStrokeWidth: 1.75,
    },
    {
        ...HEATMAP_DEFAULT_LEVEL_STYLES[1],
        fillMode: "pattern",
        pattern: "diagonal",
        patternColor: "var(--chart-scale-pattern-color)",
        patternStrokeWidth: 1.75,
    },
    HEATMAP_DEFAULT_LEVEL_STYLES[2],
    HEATMAP_DEFAULT_LEVEL_STYLES[3],
    HEATMAP_DEFAULT_LEVEL_STYLES[4],
];

interface ActivityHeatmapCardProps {
    isLoading?: boolean;
}

export const ActivityHeatmapCard = ({ isLoading = false }: ActivityHeatmapCardProps) => (
    <Stack spacing={0}>
        <Card size="sm" variant="attachedTop">
            <HStack spacing={2} mb={1} justify="space-between">
                <VStack align="flex-start" spacing={0} flex={1}>
                    <HStack spacing={1.5}>
                        <Text variant="body-md-semibold">Heatmap d&apos;activité</Text>
                        <ChartInfoTooltip label="Volume de requêtes par jour, sur les 12 dernières semaines." />
                    </HStack>
                    <Text variant="body-xs-muted">12 dernières semaines</Text>
                </VStack>
            </HStack>
        </Card>
        <Divider borderColor="borderStrong" />
        <Card size="sm" variant="attachedBottom" px={{ base: 5, md: 6 }} pt={{ base: 2, md: 3 }}>
            <HeatmapInteractionProvider>
                <HeatmapInteractionBoundary>
                    <VStack w="100%" align="stretch" spacing={4}>
                        <Box w="100%" minW={0}>
                            <HeatmapChart
                                data={heatmapData}
                                layout="fluid"
                                status={isLoading ? "loading" : "ready"}
                                loadingLabel="Chargement..."
                                levelStyles={HEATMAP_LEVEL_STYLES}
                            >
                                <HeatmapCells activeScale={1.1} inactiveOpacity={0.45} inactiveScale={1} />
                                <HeatmapSeparator
                                    groupBy="quarter"
                                    showLabels
                                    labelClassName="text-black dark:text-white"
                                    spacing={12}
                                    startOffset={14}
                                    strokeStyle="solid"
                                    stroke="var(--muted-foreground)"
                                    gradient={{
                                        from: "var(--muted-foreground)",
                                        via: "var(--muted-foreground)",
                                        to: "var(--muted-foreground)",
                                        fromOpacity: 0,
                                        viaOpacity: 1,
                                        toOpacity: 0,
                                    }}
                                />
                                <HeatmapXAxis />
                                <HeatmapYAxis />
                                <HeatmapTooltip />
                            </HeatmapChart>
                        </Box>
                        <HeatmapLegend levelStyles={HEATMAP_LEVEL_STYLES} />
                    </VStack>
                </HeatmapInteractionBoundary>
            </HeatmapInteractionProvider>
        </Card>
    </Stack>
);
