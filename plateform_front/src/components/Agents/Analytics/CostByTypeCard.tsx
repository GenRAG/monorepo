import { useMemo, useState } from "react";
import { Box, Divider, HStack, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import { PieChart as PieChartIcon } from "lucide-react";
import { CHART_GREEN_SHADES } from "themeNew/foundations/themeConfig";
import { PieCenter, PieChart, PieSlice, type PieData } from "components/charts";
import { PatternLines } from "components/charts/visx-pattern";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import { useGetCostByTypeQuery } from "services/analytics/analytics";
import { AnalyticsChartCard } from "./AnalyticsChartCard";
import { PieLegendSwatch } from "./PieLegendSwatch";
import { fmtCredits, usdToCredits } from "../../../utils/analytics/costUtils";
import { PERIOD_DAYS, type Period } from "./types";

const TYPE_COLORS = [CHART_GREEN_SHADES[3], CHART_GREEN_SHADES[2], CHART_GREEN_SHADES[0]];

const PATTERNED_INDEXES = new Set([1, 2]);

interface CostByTypeCardProps {
    workspaceId: string;
    agentId: string;
}

export const CostByTypeCard = ({ workspaceId, agentId }: CostByTypeCardProps) => {
    const [period, setPeriod] = useState<Period>("30j");
    const { data: entries = [], isLoading } = useGetCostByTypeQuery(
        { workspaceId, agentId, days: PERIOD_DAYS[period] },
        { skip: !workspaceId || !agentId },
    );
    const isEmpty = !isLoading && entries.length === 0;
    const totalCredits = useMemo(() => entries.reduce((s, e) => s + usdToCredits(e.costUsd), 0), [entries]);

    const pieData: (PieData & { rawValue: number })[] = useMemo(
        () =>
            [...entries]
                .sort((a, b) => b.costUsd - a.costUsd)
                .map((entry, index) => {
                    const rawValue = usdToCredits(entry.costUsd);
                    return {
                        label: entry.key,
                        value: rawValue,
                        rawValue,
                        color: TYPE_COLORS[index % TYPE_COLORS.length],
                    };
                }),
        [entries],
    );

    return (
        <AnalyticsChartCard
            title="Crédits par étape"
            tooltip="Répartition des crédits consommés entre réponse, recherche et classement."
            subtitle="Vous permet de voir quelle étape consomme le plus"
            period={period}
            onPeriodChange={setPeriod}
            showPeriodSelector={!isEmpty}
            contentCardProps={{ h: "100%", display: "flex", flexDirection: "column" }}
        >
            {isEmpty ? (
                <CardEmptyState
                    icon={PieChartIcon}
                    title="Aucune consommation"
                    description="La répartition des crédits par étape apparaîtra ici une fois des requêtes exécutées."
                />
            ) : (
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
                            >
                                {isLoading ? (
                                    <SkeletonCircle
                                        startColor="skeletonStart"
                                        endColor="skeletonEnd"
                                        w="100%"
                                        h="100%"
                                    />
                                ) : (
                                    <PieChart data={pieData} innerRadius={55}>
                                        <PatternLines
                                            height={6}
                                            id="ct-1"
                                            orientation={["diagonal"]}
                                            stroke={TYPE_COLORS[0]}
                                            width={6}
                                        />
                                        <PatternLines
                                            height={6}
                                            id="ct-2"
                                            orientation={["diagonal"]}
                                            stroke={TYPE_COLORS[1]}
                                            width={6}
                                        />
                                        {pieData.map((_, index) => (
                                            <PieSlice
                                                key={index}
                                                fill={
                                                    PATTERNED_INDEXES.has(index)
                                                        ? `url(#ct-${index + 1})`
                                                        : TYPE_COLORS[index]
                                                }
                                                index={index}
                                            />
                                        ))}
                                        <PieCenter
                                            defaultLabel="Crédits"
                                            formatOptions={{ maximumFractionDigits: 0 }}
                                        />
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
                                {isLoading
                                    ? [1, 2, 3].map((i) => (
                                          <HStack h="100%" key={i} justify="space-between" p={2} minW={0}>
                                              <HStack spacing={2} minW={0}>
                                                  <Skeleton
                                                      startColor="skeletonStart"
                                                      endColor="skeletonEnd"
                                                      w={4}
                                                      h={4}
                                                      borderRadius="4px"
                                                      flexShrink={0}
                                                  />
                                                  <Skeleton
                                                      startColor="skeletonStart"
                                                      endColor="skeletonEnd"
                                                      h="14px"
                                                      w="90px"
                                                      borderRadius="4px"
                                                  />
                                              </HStack>
                                              <Skeleton
                                                  startColor="skeletonStart"
                                                  endColor="skeletonEnd"
                                                  h="14px"
                                                  w="36px"
                                                  borderRadius="4px"
                                              />
                                          </HStack>
                                      ))
                                    : pieData.map((item, index) => (
                                          <HStack h="100%" key={index} justify="space-between" p={2} minW={0}>
                                              <HStack spacing={2} minW={0}>
                                                  <PieLegendSwatch
                                                      color={TYPE_COLORS[index]}
                                                      patterned={PATTERNED_INDEXES.has(index)}
                                                  />
                                                  <Text variant="body-sm" noOfLines={1}>
                                                      {item.label}
                                                  </Text>
                                              </HStack>
                                              <VStack spacing={0} align="flex-end" flexShrink={0}>
                                                  <Text variant="body-sm-semibold" color="textStrong">
                                                      {fmtCredits(item.rawValue)}
                                                  </Text>
                                                  <Text fontSize="xs" color="textFaint">
                                                      {totalCredits > 0
                                                          ? ((item.rawValue / totalCredits) * 100).toFixed(1)
                                                          : "0.0"}
                                                      %
                                                  </Text>
                                              </VStack>
                                          </HStack>
                                      ))}
                            </VStack>
                        </HStack>
                    </Box>
                </Box>
            )}
        </AnalyticsChartCard>
    );
};
