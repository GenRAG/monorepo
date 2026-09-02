import { Badge, Box, Card, HStack, Icon, Skeleton, Text, useColorModeValue } from "@chakra-ui/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { curveCardinal } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";
import { useEffect, useId, useState } from "react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";
import { Area, AreaChart, ChartStatFlow, useChart } from "components/charts";

/** AreaChart is time-scaled; the axis is never shown here, so placeholder
 * dates only drive point spacing along x. */
const toSparkRows = (values: number[]) => values.map((value, i) => ({ date: new Date(2020, 0, 1 + i), value }));

/**
 * Percent change between the last point and an earlier reference point.
 * Uses the series midpoint rather than the first point so ease-in curves
 * (which start at exactly 0) still yield a meaningful percentage.
 */
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

/** Reads the chart's hover context and lifts the scrubbed value up to the card. */
const SparkHoverBridge = ({ onHoverChange }: { onHoverChange: (state: HoverState) => void }) => {
    const { tooltipData } = useChart();

    useEffect(() => {
        const raw = tooltipData?.point?.value;
        onHoverChange({ value: typeof raw === "number" ? raw : null });
    }, [tooltipData, onHoverChange]);

    return null;
};

interface MetricCardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    trend: string;
    trendPositive: boolean;
    trendNeutral?: boolean;
    sparkData: number[];
    sparkColor?: string;
    isLoading?: boolean;
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
    isLoading = false,
}: MetricCardProps) => {
    const trendGreen = useColorModeValue("green.600", "green.400");
    const trendOrange = useColorModeValue("orange.500", "orange.300");
    const trendRed = useColorModeValue("red.500", "red.400");
    const trendCol = trendNeutral ? trendOrange : trendPositive ? trendGreen : trendRed;
    const accentColor = sparkColor ?? currentDarkTheme.hex.primary;

    const gradientId = `metric-spark-fill-${useId()}`;
    const [hover, setHover] = useState<HoverState>({ value: null });
    const displayValue = hover.value ?? value;

    const trendPercent = computeTrendPercent(sparkData);
    const trendPercentPositive = (trendPercent ?? 0) >= 0;

    const skeletonProps = { startColor: "skeletonStart", endColor: "skeletonEnd" };

    return (
        <Card size="none" p={4} display="flex" flexDirection="column" gap={2} overflow="hidden">
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
                                color={trendPercentPositive ? trendGreen : trendRed}
                            >
                                <Icon as={trendPercentPositive ? TrendingUp : TrendingDown} boxSize={2.5} />
                                {trendPercentPositive ? "+" : ""}
                                {trendPercent.toFixed(1)}%
                            </Badge>
                        )}
                    </>
                )}
            </HStack>

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

            <Box mt="auto" mx={-4} h="70px" position="relative" minW={0}>
                <Box position="absolute" inset={0}>
                    <AreaChart
                        status={isLoading ? "loading" : "ready"}
                        loadingLabel=""
                        data={toSparkRows(sparkData)}
                        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
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
        </Card>
    );
};
