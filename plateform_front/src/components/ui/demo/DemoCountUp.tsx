import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { DEMO_EASE } from "components/ui/demo/DemoStage";

interface DemoCountUpProps {
    value: number;
    decimals?: number;
    suffix?: string;
    duration?: number;
}

export const DemoCountUp = ({ value, decimals = 0, suffix = "", duration = 0.9 }: DemoCountUpProps) => {
    const motionValue = useMotionValue(0);
    const display = useTransform(motionValue, (v) => `${v.toFixed(decimals)}${suffix}`);

    useEffect(() => {
        const controls = animate(motionValue, value, { duration, ease: DEMO_EASE });
        return () => controls.stop();
    }, [motionValue, value, duration]);

    return <motion.span>{display}</motion.span>;
};
