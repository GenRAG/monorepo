import { Box, Card, Divider, HStack, SkeletonCircle, Stack, Text, VStack } from "@chakra-ui/react";
import { PieChart as PieChartIcon } from "lucide-react";
import { PieCenter, PieChart, PieSlice, type PieData } from "components/charts";
import { ChartInfoTooltip } from "components/Agents/Analytics/ChartInfoTooltip";
import { PieLegendSwatch } from "components/Agents/Analytics/PieLegendSwatch";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";

interface DatasetPieCardProps {
    title: string;
    tooltip: string;
    subtitle: string;
    centerLabel: string;
    items: PieData[];
    isLoading: boolean;
}

/** Donut + legend (label, count, share): the legend carries identity, the color only repeats it. */
export const DatasetPieCard = ({ title, tooltip, subtitle, centerLabel, items, isLoading }: DatasetPieCardProps) => {
    const total = items.reduce((sum, item) => sum + item.value, 0);

    return (
        <Stack spacing={0} h="100%">
            <Card variant="attachedTop" size="sm">
                <VStack align="flex-start" spacing={0}>
                    <HStack spacing={1.5}>
                        <Text variant="body-md-semibold">{title}</Text>
                        <ChartInfoTooltip label={tooltip} />
                    </HStack>
                    <Text variant="body-xs-muted">{subtitle}</Text>
                </VStack>
            </Card>
            <Divider borderColor="borderStrong" />
            <Card variant="attachedBottom" size="none" flex={1} display="flex" flexDirection="column">
                {total === 0 && !isLoading ? (
                    <CardEmptyState
                        icon={PieChartIcon}
                        title="Aucun document"
                        description="Importez des documents pour voir la répartition."
                    />
                ) : (
                    <HStack flex={1} p={5} spacing={6} flexWrap={{ base: "wrap", sm: "nowrap" }} justify="center">
                        <Box w="180px" h="180px" flexShrink={0}>
                            {isLoading ? (
                                <SkeletonCircle w="100%" h="100%" />
                            ) : (
                                <PieChart data={items} innerRadius={52} padAngle={0.03} cornerRadius={4}>
                                    {items.map((item, index) => (
                                        <PieSlice key={item.label} index={index} fill={item.color} />
                                    ))}
                                    <PieCenter defaultLabel={centerLabel} />
                                </PieChart>
                            )}
                        </Box>
                        <VStack
                            flex={1}
                            minW="180px"
                            align="stretch"
                            spacing={0}
                            divider={<Divider borderColor="borderDefault" />}
                        >
                            {items.map((item) => (
                                <HStack key={item.label} justify="space-between" py={2.5}>
                                    <HStack spacing={2} minW={0}>
                                        <PieLegendSwatch color={item.color ?? "grey"} w={3} h={3} />
                                        <Text variant="body-sm" noOfLines={1}>
                                            {item.label}
                                        </Text>
                                    </HStack>
                                    <HStack spacing={3}>
                                        <Text variant="body-sm-semibold" color="textStrong">
                                            {item.value}
                                        </Text>
                                        <Text variant="body-xs-muted" w="44px" textAlign="right">
                                            {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                                        </Text>
                                    </HStack>
                                </HStack>
                            ))}
                        </VStack>
                    </HStack>
                )}
            </Card>
        </Stack>
    );
};
