import { useMemo } from "react";
import { Box, Card, Divider, HStack, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { ParentSize } from "@visx/responsive";
import { Gauge } from "components/charts";
import { ChartInfoTooltip } from "components/Agents/Analytics/ChartInfoTooltip";
import { PieLegendSwatch } from "components/Agents/Analytics/PieLegendSwatch";
import { DatasetAnalytics } from "types/dataset/dataset";
import { formatFileSize } from "utils/documentFormatters";
import { FILE_TYPE_GROUPS, getFileTypeGroup, useDatasetChartPalette } from "./datasetChartPalette";

// Width (px) of one notch + its gap, as on the billing plan card.
const NOTCH_PITCH_PX = 4;

interface DatasetStorageCardProps {
    analytics?: DatasetAnalytics;
    isLoading: boolean;
}

export const DatasetStorageCard = ({ analytics, isLoading }: DatasetStorageCardProps) => {
    const palette = useDatasetChartPalette();

    const groups = useMemo(() => {
        const totals = new Map(FILE_TYPE_GROUPS.map((group) => [group, { size: 0, count: 0 }]));
        for (const row of analytics?.sizeByMimeType ?? []) {
            const entry = totals.get(getFileTypeGroup(row.mimeType))!;
            entry.size += row.size;
            entry.count += row.count;
        }
        return FILE_TYPE_GROUPS.map((group, index) => ({ group, color: palette[index], ...totals.get(group)! }));
    }, [analytics, palette]);

    const quota = analytics?.quotaBytes ?? 1;
    const used = analytics?.totalSize ?? 0;
    const usedPct = Math.min((used / quota) * 100, 100);

    return (
        <Stack spacing={0} h="100%">
            <Card variant="attachedTop" size="sm">
                <VStack align="flex-start" spacing={0}>
                    <HStack spacing={1.5}>
                        <Text variant="body-md-semibold">Stockage</Text>
                        <ChartInfoTooltip label="Place occupée par les documents de la base, par type de fichier." />
                    </HStack>
                    <Text variant="body-xs-muted">Espace utilisé sur le quota de la base</Text>
                </VStack>
            </Card>
            <Divider borderColor="borderStrong" />
            <Card variant="attachedBottom" size="none" p={5} flex={1} display="flex" flexDirection="column" gap={4}>
                {isLoading || !analytics ? (
                    <Stack spacing={3}>
                        <Skeleton h="32px" w="160px" borderRadius="4px" />
                        <Skeleton h="10px" borderRadius="full" />
                        <Skeleton h="80px" borderRadius="8px" />
                    </Stack>
                ) : (
                    <>
                        <VStack align="start" spacing={0.5}>
                            <HStack align="baseline" spacing={2}>
                                <Text
                                    variant="number-md"
                                    fontSize="28px"
                                    fontWeight="700"
                                    color="textStrong"
                                    lineHeight="1"
                                >
                                    {formatFileSize(used)}
                                </Text>
                                <Text variant="body-sm-semibold" color="textLabel">
                                    {usedPct.toFixed(1)} %
                                </Text>
                            </HStack>
                            <Text variant="body-xs-muted">
                                sur {formatFileSize(quota)} · {formatFileSize(Math.max(quota - used, 0))} disponibles
                            </Text>
                        </VStack>

                        <Box role="img" aria-label={`${usedPct.toFixed(1)} % du stockage utilisé`}>
                            <ParentSize debounceTime={10}>
                                {({ width }) =>
                                    width > 0 ? (
                                        <Gauge
                                            orientation="linear"
                                            value={usedPct}
                                            width={width}
                                            linearHeight={10}
                                            notchCornerRadius={3}
                                            notchWidthPercent={60}
                                            totalNotches={Math.max(20, Math.round(width / NOTCH_PITCH_PX))}
                                            inactiveFill="var(--border)"
                                        />
                                    ) : null
                                }
                            </ParentSize>
                        </Box>

                        <VStack align="stretch" spacing={0} divider={<Divider borderColor="borderDefault" />}>
                            {groups.map((g) => (
                                <HStack key={g.group} justify="space-between" py={2}>
                                    <HStack spacing={2}>
                                        <PieLegendSwatch color={g.color} w={3} h={3} />
                                        <Text variant="body-sm">{g.group}</Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                        <Text variant="body-xs-muted">
                                            {g.count} doc{g.count > 1 ? "s" : ""}
                                        </Text>
                                        <Text variant="body-sm-semibold" color="textStrong" w="72px" textAlign="right">
                                            {formatFileSize(g.size)}
                                        </Text>
                                    </HStack>
                                </HStack>
                            ))}
                        </VStack>
                    </>
                )}
            </Card>
        </Stack>
    );
};
