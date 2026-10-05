import { Box, Skeleton } from "@chakra-ui/react";
import { Bar, BarChart, useChart } from "components/charts";
import { ChartHoverBridge, type HoverState } from "components/ui/ChartHoverBridge";
import type { BarDatum } from "components/Dashboard/MetricCard";

const BAR_AREA_WIDTH = 120;
const BAR_RADIUS = 4;

// Même piste de fond que Billing/ConsumptionCard : un rect pleine hauteur derrière chaque barre,
// pour montrer la "capacité" totale du slot plutôt qu'un fond vide.
const BackgroundTrack = () => {
    const { data, barScale, bandWidth, barXAccessor, innerHeight } = useChart();
    if (!(barScale && bandWidth && barXAccessor)) return null;

    return (
        <>
            {data.map((d, i) => {
                const x = barScale(barXAccessor(d)) ?? 0;
                return (
                    <rect
                        key={`bg-track-${i}`}
                        x={x}
                        y={0}
                        width={bandWidth}
                        height={innerHeight}
                        rx={BAR_RADIUS}
                        ry={BAR_RADIUS}
                        fill="var(--chart-grid)"
                    />
                );
            })}
        </>
    );
};

interface MetricBarChartProps {
    data: BarDatum[];
    color: string;
    isLoading: boolean;
    onHoverChange: (state: HoverState) => void;
}

export const MetricBarChart = ({ data, color, isLoading, onHoverChange }: MetricBarChartProps) => {
    if (isLoading) {
        return <Skeleton w={`${BAR_AREA_WIDTH}px`} h="90px" borderRadius="8px" flexShrink={0} />;
    }

    return (
        // mb/mr négatifs pour annuler le padding de la Card (p={4}) : les barres doivent sembler
        // "sortir" de la card par le bas/la droite plutôt que rester cantonnées dans son padding,
        // contrairement au pie chart (MetricCompositionPie) qui lui reste inset.
        <Box w={`${BAR_AREA_WIDTH}px`} flexShrink={0} position="relative" mb={-4} mr={-4} overflow="hidden">
            <Box position="absolute" inset={0} mt={8}>
                <BarChart
                    status="ready"
                    data={data}
                    xDataKey="label"
                    margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
                    aspectRatio=""
                    className="h-full"
                >
                    <ChartHoverBridge onHoverChange={onHoverChange} />
                    <BackgroundTrack />
                    <Bar dataKey="value" fill={color} lineCap={BAR_RADIUS} />
                </BarChart>
            </Box>
        </Box>
    );
};
