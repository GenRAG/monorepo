import { Badge, Box, Card, HStack, Icon, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { curveCardinal } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";
import { useEffect, useId, useState } from "react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import {
    Area,
    AreaChart,
    ChartStatFlow,
    PieCenter,
    PieChart,
    PieSlice,
    useChart,
    type PieData,
} from "components/charts";
import { PatternLines } from "@/components/charts/visx-pattern";

const toSparkRows = (values: number[]) => values.map((value, i) => ({ date: new Date(2020, 0, 1 + i), value }));

const computeTrendPercent = (data: number[]): number | null => {
    if (data.length < 2) return null;

    const last = data[data.length - 1];
    const midpoint = data[Math.floor((data.length - 1) / 2)];
    const reference = midpoint !== 0 ? midpoint : data.find((v) => v !== 0);

    if (reference === undefined || reference === 0) return null;

    return ((last - reference) / reference) * 100;
};

interface HoverState {
    value: number | null;
}

const SparkHoverBridge = ({ onHoverChange }: { onHoverChange: (state: HoverState) => void }) => {
    const { tooltipData } = useChart();

    useEffect(() => {
        const raw = tooltipData?.point?.value;
        onHoverChange({ value: typeof raw === "number" ? raw : null });
    }, [tooltipData, onHoverChange]);

    return null;
};

export interface CompositionSegment {
    label: string;
    value: number;
    color: string;
}

const COMPOSITION_PIE_SIZE = 160;

const CompositionPie = ({
    segments,
    isLoading,
    defaultLabel,
}: {
    segments: CompositionSegment[];
    isLoading: boolean;
    defaultLabel: string;
}) => {
    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };
    const patternIdBase = `metric-pie-pattern-${useId()}`;
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);

    if (isLoading) {
        return (
            <VStack spacing={2} flexShrink={0}>
                <SkeletonCircle {...skeletonProps} boxSize={`${COMPOSITION_PIE_SIZE}px`} />
                <Skeleton {...skeletonProps} h="8px" w="70px" borderRadius="4px" />
            </VStack>
        );
    }

    const pieData: PieData[] = segments.map((segment) => ({
        label: segment.label,
        value: segment.value,
        color: segment.color,
    }));

    return (
        <VStack spacing={2} flexShrink={0} align="center" pt={4} pb={1}>
            <Box boxSize={`${COMPOSITION_PIE_SIZE}px`} flexShrink={0}>
                {total > 0 ? (
                    <PieChart data={pieData} size={COMPOSITION_PIE_SIZE} innerRadius={50} hoverOffset={0}>
                        {segments.map((segment, index) => (
                            <PatternLines
                                key={`pattern-${index}`}
                                id={`${patternIdBase}-${index}`}
                                height={6}
                                width={6}
                                orientation={["diagonal"]}
                                stroke={segment.color}
                            />
                        ))}
                        {pieData.map((_, index) => (
                            <PieSlice
                                key={index}
                                index={index}
                                fill={`url(#${patternIdBase}-${index})`}
                                animate={false}
                                showGlow={false}
                                hoverEffect="none"
                            />
                        ))}
                        <PieCenter defaultLabel={defaultLabel} />
                    </PieChart>
                ) : (
                    <Box boxSize="full" borderRadius="full" bg="surfaceHover" />
                )}
            </Box>
        </VStack>
    );
};

interface MetricCardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    trend: string;
    trendPositive: boolean;
    trendNeutral?: boolean;
    sparkData?: number[];
    sparkColor?: string;
    composition?: CompositionSegment[];
    isLoading?: boolean;
    defaultLabel?: string;
}

export const MetricCard = ({
    icon,
    label,
    value,
    trend,
    trendPositive,
    trendNeutral,
    sparkData,
    sparkColor,
    composition,
    isLoading = false,
    defaultLabel = "Documents",
}: MetricCardProps) => {
    const trendCol = trendNeutral ? "trendNeutral" : trendPositive ? "trendPositive" : "trendNegative";
    const accentColor = sparkColor ?? currentDarkTheme.hex.primary;

    const gradientId = `metric-spark-fill-${useId()}`;
    const [hover, setHover] = useState<HoverState>({ value: null });
    const displayValue = hover.value ?? value;

    const trendPercent = sparkData ? computeTrendPercent(sparkData) : null;
    const trendPercentPositive = (trendPercent ?? 0) >= 0;

    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    const headerRow = (
        <HStack justify="space-between" align="start">
            {isLoading ? (
                <Skeleton {...skeletonProps} h="10px" w="110px" borderRadius="4px" />
            ) : (
                <>
                    <HStack spacing={1.5}>
                        <Icon as={icon} boxSize={3} color="textLabel" />
                        <Text variant="body-sm-muted">{label}</Text>
                    </HStack>
                    {trendPercent !== null && (
                        <Badge
                            display="flex"
                            alignItems="center"
                            gap={0.5}
                            px={1.5}
                            py={0.5}
                            borderRadius="full"
                            bg={trendPercentPositive ? "rgba(52,211,169,0.12)" : "rgba(239,68,68,0.12)"}
                            color={trendPercentPositive ? "trendPositive" : "trendNegative"}
                        >
                            <Icon as={trendPercentPositive ? TrendingUp : TrendingDown} boxSize={2.5} />
                            {trendPercentPositive ? "+" : ""}
                            {trendPercent.toFixed(1)}%
                        </Badge>
                    )}
                </>
            )}
        </HStack>
    );

    const valueBlock = (
        <Box>
            {isLoading ? (
                <Skeleton {...skeletonProps} h="28px" w="80px" borderRadius="6px" mb={2} />
            ) : (
                <ChartStatFlow
                    value={displayValue}
                    label=""
                    valueClassName="text-3xl font-bold"
                    labelClassName="hidden"
                />
            )}
            {isLoading ? (
                <Skeleton {...skeletonProps} h="10px" w="60px" borderRadius="4px" />
            ) : (
                <HStack spacing={1}>
                    <Icon
                        as={trendPositive && !trendNeutral ? TrendingUp : trendNeutral ? TrendingUp : TrendingDown}
                        boxSize={3}
                        color={trendCol}
                    />
                    <Text fontSize="xs" fontWeight="600" color={trendCol}>
                        {hover.value !== null ? "Survolé" : trend}
                    </Text>
                </HStack>
            )}
        </Box>
    );

    if (composition) {
        return (
            <Card size="none" p={4} display="flex" flexDirection="row" gap={3} overflow="hidden">
                <VStack align="stretch" spacing={2} flex={1} minW={0}>
                    {headerRow}
                    {valueBlock}
                </VStack>
                <CompositionPie segments={composition} isLoading={isLoading} defaultLabel={defaultLabel} />
            </Card>
        );
    }

    return (
        <Card size="none" p={4} display="flex" flexDirection="column" gap={2} overflow="hidden">
            {headerRow}
            {valueBlock}

            {sparkData && sparkData.length > 0 && (
                <Box mt="auto" mx={-4} h="70px" position="relative" minW={0}>
                    <Box position="absolute" inset={0}>
                        <AreaChart
                            status={isLoading ? "loading" : "ready"}
                            loadingLabel=""
                            data={toSparkRows(sparkData ?? [])}
                            margin={{ top: 1, right: 0, bottom: 10, left: 0 }}
                            aspectRatio=""
                            className="h-full"
                        >
                            <SparkHoverBridge onHoverChange={setHover} />
                            <LinearGradient
                                id={gradientId}
                                from={accentColor}
                                fromOpacity={0.4}
                                to={accentColor}
                                toOpacity={0}
                            />
                            <Area
                                dataKey="value"
                                curve={curveCardinal.tension(0.65)}
                                stroke={accentColor}
                                fill={`url(#${gradientId})`}
                                fillOpacity={1}
                                strokeWidth={1.5}
                                showHighlight
                                loadingStroke={accentColor}
                            />
                        </AreaChart>
                    </Box>
                </Box>
            )}
        </Card>
    );
};
