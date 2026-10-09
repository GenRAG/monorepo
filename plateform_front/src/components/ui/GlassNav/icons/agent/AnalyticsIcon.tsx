import { useId } from "react";
import { motion } from "framer-motion";
import { AnimatedIconProps } from "../types";
import { useIconAnimationState } from "../useIconAnimationState";
import { AnimatedSvg } from "../AnimatedSvg";

// Analytics: the bars bounce like an audio equalizer while hovered. Bars grow from their base (y=17) and are
// clipped above the x axis, so a bar never runs over it.
const BARS = [
    { x: 8, top: 14, levels: [14, 8, 11, 14] },
    { x: 13, top: 5, levels: [5, 11, 7, 5] },
    { x: 18, top: 9, levels: [9, 5, 13, 9] },
];

export const AnalyticsIcon = ({ size = 18, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);
    const clipId = useId();

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers} stroked>
            <defs>
                <clipPath id={clipId}>
                    <rect x={4} y={0} width={20} height={18.5} />
                </clipPath>
            </defs>
            <path d="M3 3v18h18" />
            <g clipPath={`url(#${clipId})`}>
                {BARS.map((bar, index) => (
                    <motion.line
                        key={bar.x}
                        x1={bar.x}
                        x2={bar.x}
                        y2={17}
                        variants={{
                            initial: { y1: bar.top },
                            hover: {
                                y1: bar.levels,
                                transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: index * 0.08 },
                            },
                            active: { y1: bar.top },
                        }}
                        initial="initial"
                        animate={label}
                    />
                ))}
            </g>
        </AnimatedSvg>
    );
};
