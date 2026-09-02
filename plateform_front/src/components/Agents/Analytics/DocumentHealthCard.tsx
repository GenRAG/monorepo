import { Box, Card, HStack, Stack, Text, VStack, Divider, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import { CHART_GREEN_SHADES } from "themeNew/foundations/themeConfig";
import { PieChart, PieSlice, type PieData, PieCenter } from "components/charts";
import { DOCUMENT_HEALTH } from "./mockData";
import { PatternLines } from "@/components/charts/visx-pattern";
import { ChartInfoTooltip } from "./ChartInfoTooltip";
import { PieLegendSwatch } from "./PieLegendSwatch";

// Indexés, En cours, Uploadés, Échoués.
const DOCUMENT_HEALTH_COLORS = [
    CHART_GREEN_SHADES[2],
    CHART_GREEN_SHADES[3],
    CHART_GREEN_SHADES[0],
    CHART_GREEN_SHADES[1],
];
// Only the smaller slices get the diagonal texture — the dominant slice (Indexés) stays solid.
const PATTERNED_INDEXES = new Set([1, 2, 3]);

const pieData: PieData[] = DOCUMENT_HEALTH.map((status, index) => ({
    label: status.name,
    value: status.value,
    color: DOCUMENT_HEALTH_COLORS[index],
}));

const totalDocuments = pieData.reduce((sum, status) => sum + status.value, 0);

interface DocumentHealthCardProps {
    isLoading?: boolean;
}

export const DocumentHealthCard = ({ isLoading = false }: DocumentHealthCardProps) => {
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    return (
        <Stack spacing={0}>
            <Card variant="attachedTop" size="sm">
                <HStack spacing={2}>
                    <VStack align="flex-start" spacing={0} flex={1}>
                        <HStack spacing={1.5}>
                            <Text variant="body-md-semibold">Santé des documents</Text>
                            <ChartInfoTooltip label="Répartition des documents de l'agent par statut d'indexation." />
                        </HStack>
                        <Text variant="body-xs-muted">
                            Vous permet de suivre l&apos;évolution de la santé de vos documents
                        </Text>
                    </VStack>
                </HStack>
            </Card>
            <Divider borderColor="borderStrong" />
            <Card variant="attachedBottom" size="none" h="100%" display="flex" flexDirection="column">
                <Box position="relative" flex={1} minH="160px" minW={0} w="100%">
                    <Box
                        w="100%"
                        h="100%"
                        position="absolute"
                        inset={0}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <HStack w="100%" flexWrap={{ base: "wrap", sm: "nowrap" }} justify="center" rowGap={4}>
                            <Box
                                w={{ base: "160px", sm: "180px", md: "230px" }}
                                h={{ base: "160px", sm: "180px", md: "230px" }}
                                flexShrink={0}
                                ml={2}
                            >
                                {isLoading ? (
                                    <SkeletonCircle {...skeletonProps} w="100%" h="100%" />
                                ) : (
                                    <PieChart data={pieData} innerRadius={55}>
                                        <PatternLines
                                            height={6}
                                            id="dp-1"
                                            orientation={["diagonal"]}
                                            stroke={DOCUMENT_HEALTH_COLORS[0]}
                                            width={6}
                                        />
                                        <PatternLines
                                            height={6}
                                            id="dp-2"
                                            orientation={["diagonal"]}
                                            stroke={DOCUMENT_HEALTH_COLORS[1]}
                                            width={6}
                                        />
                                        <PatternLines
                                            height={6}
                                            id="dp-3"
                                            orientation={["diagonal"]}
                                            stroke={DOCUMENT_HEALTH_COLORS[2]}
                                            width={6}
                                        />
                                        <PatternLines
                                            height={8}
                                            id="dp-4"
                                            orientation={["diagonal"]}
                                            stroke={DOCUMENT_HEALTH_COLORS[3]}
                                            width={8}
                                        />
                                        {pieData.map((_, index) => (
                                            <PieSlice
                                                key={index}
                                                fill={
                                                    PATTERNED_INDEXES.has(index)
                                                        ? `url(#dp-${index + 1})`
                                                        : DOCUMENT_HEALTH_COLORS[index]
                                                }
                                                index={index}
                                            />
                                        ))}
                                        <PieCenter defaultLabel="Documents" />
                                    </PieChart>
                                )}
                            </Box>
                            <VStack
                                h="100%"
                                flex={1}
                                minW="200px"
                                spacing={4}
                                align="stretch"
                                divider={<Divider borderColor="borderDefault" />}
                            >
                                {pieData.map((status, index) => (
                                    <HStack h="100%" key={index} justify="space-between" p={2}>
                                        <HStack spacing={2} minW={0}>
                                            {isLoading ? (
                                                <Skeleton
                                                    {...skeletonProps}
                                                    w={5}
                                                    h={5}
                                                    borderRadius="4px"
                                                    flexShrink={0}
                                                />
                                            ) : (
                                                <PieLegendSwatch
                                                    color={DOCUMENT_HEALTH_COLORS[index]}
                                                    patterned={PATTERNED_INDEXES.has(index)}
                                                />
                                            )}
                                            {isLoading ? (
                                                <Skeleton {...skeletonProps} h="14px" w="90px" borderRadius="4px" />
                                            ) : (
                                                <Text variant="body-sm" noOfLines={1}>
                                                    {status.label}
                                                </Text>
                                            )}
                                        </HStack>
                                        {isLoading ? (
                                            <Skeleton {...skeletonProps} h="14px" w="36px" borderRadius="4px" />
                                        ) : (
                                            <Text variant="body-sm-semibold" color="textStrong">
                                                {((status.value / totalDocuments) * 100).toFixed(1)}%
                                            </Text>
                                        )}
                                    </HStack>
                                ))}
                            </VStack>
                        </HStack>
                    </Box>
                </Box>
            </Card>
        </Stack>
    );
};
