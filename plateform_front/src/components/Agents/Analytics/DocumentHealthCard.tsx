import { Box, Card, HStack, Stack, Text, VStack, Divider, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import { CHART_GREEN_SHADES, STATUS_COLORS } from "themeNew/foundations/themeConfig";
import { PieChart, PieSlice, type PieData, PieCenter } from "components/charts";
import { useGetDocumentHealthQuery } from "services/analytics/analytics";
import { PatternLines } from "components/charts/visx-pattern";
import { ChartInfoTooltip } from "./ChartInfoTooltip";
import { PieLegendSwatch } from "./PieLegendSwatch";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { PieChart as PieChartIcon } from "lucide-react";

const DOCUMENT_HEALTH_COLORS = [
    CHART_GREEN_SHADES[2],
    STATUS_COLORS["warning"],
    CHART_GREEN_SHADES[0],
    STATUS_COLORS["error"],
];

const PATTERNED_INDEXES = new Set([1, 2, 3]);

interface DocumentHealthCardProps {
    workspaceId: string;
    agentId: string;
}

export const DocumentHealthCard = ({ workspaceId, agentId }: DocumentHealthCardProps) => {
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };
    const { data: health, isLoading } = useGetDocumentHealthQuery(
        { workspaceId, agentId },
        { skip: !workspaceId || !agentId },
    );

    const pieData: PieData[] = [
        { label: "Indexés", value: health?.indexed ?? 0, color: DOCUMENT_HEALTH_COLORS[0] },
        { label: "En cours", value: health?.processing ?? 0, color: DOCUMENT_HEALTH_COLORS[1] },
        { label: "Uploadés", value: health?.uploaded ?? 0, color: DOCUMENT_HEALTH_COLORS[2] },
        { label: "Échoués", value: health?.failed ?? 0, color: DOCUMENT_HEALTH_COLORS[3] },
    ];
    const totalDocuments = health?.total ?? 0;

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
                {totalDocuments === 0 && !isLoading ? (
                    <CardEmptyState
                        icon={PieChartIcon}
                        title="Aucun document"
                        description="Aucun document n'a été trouvé pour cet agent."
                    />
                ) : (
                    <Box position="relative" flex={1} minH="260px" minW={0} w="100%">
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
                                                    {totalDocuments > 0
                                                        ? ((status.value / totalDocuments) * 100).toFixed(1)
                                                        : "0.0"}
                                                    %
                                                </Text>
                                            )}
                                        </HStack>
                                    ))}
                                </VStack>
                            </HStack>
                        </Box>
                    </Box>
                )}
            </Card>
        </Stack>
    );
};
