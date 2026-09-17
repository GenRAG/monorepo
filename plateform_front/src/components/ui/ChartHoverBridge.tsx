import { useEffect } from "react";
import { useChart } from "components/charts";

export interface HoverState {
    value: number | null;
    label: string | null;
}

/** Reads the chart's hover context and lifts the scrubbed point up to the card. */
export const ChartHoverBridge = ({ onHoverChange }: { onHoverChange: (state: HoverState) => void }) => {
    const { tooltipData } = useChart();
    useEffect(() => {
        const point = tooltipData?.point;
        const value = typeof point?.value === "number" ? point.value : null;
        const label = typeof point?.label === "string" ? point.label : null;
        onHoverChange({ value, label });
    }, [tooltipData, onHoverChange]);
    return null;
};

export interface LatencyHoverState {
    p50: number | null;
    p95: number | null;
    label: string | null;
}

/** Same as `ChartHoverBridge`, for the two-series latency chart (p50 + p95). */
export const LatencyHoverBridge = ({ onHoverChange }: { onHoverChange: (state: LatencyHoverState) => void }) => {
    const { tooltipData } = useChart();
    useEffect(() => {
        const point = tooltipData?.point;
        const p50 = typeof point?.p50 === "number" ? point.p50 : null;
        const p95 = typeof point?.p95 === "number" ? point.p95 : null;
        const label = typeof point?.label === "string" ? point.label : null;
        onHoverChange({ p50, p95, label });
    }, [tooltipData, onHoverChange]);
    return null;
};
