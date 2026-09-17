import { Box, Skeleton, SkeletonCircle, VStack } from "@chakra-ui/react";
import { useId } from "react";
import { PieCenter, PieChart, PieSlice, type PieData } from "components/charts";
import { PatternLines } from "components/charts/visx-pattern";

export interface CompositionSegment {
    label: string;
    value: number;
    color: string;
}

const COMPOSITION_PIE_SIZE = 160;

interface MetricCompositionPieProps {
    segments: CompositionSegment[];
    isLoading: boolean;
    defaultLabel: string;
}

export const MetricCompositionPie = ({ segments, isLoading, defaultLabel }: MetricCompositionPieProps) => {
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
