import { motion } from "framer-motion";
import { AnimatedIconProps } from "../types";
import { useIconAnimationState } from "../useIconAnimationState";
import { AnimatedSvg } from "../AnimatedSvg";

// Architecture: the links between the blocks draw themselves, then a signal runs through the graph.
const EDGES = ["M8.5 7.3 15.5 10.7", "M8.5 16.7 15.5 13.3", "M6 8.5v7"];

export const WorkflowIcon = ({ size = 18, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers} stroked>
            {EDGES.map((d, index) => (
                <motion.path
                    key={d}
                    d={d}
                    variants={{
                        initial: { pathLength: 1 },
                        hover: { pathLength: [0, 1], transition: { duration: 0.35, delay: 0.1 + index * 0.12 } },
                        active: { pathLength: 1 },
                    }}
                    initial="initial"
                    animate={label}
                />
            ))}
            <circle cx={6} cy={6} r={2.5} />
            <circle cx={6} cy={18} r={2.5} />
            <motion.circle
                cx={18}
                cy={12}
                r={2.5}
                variants={{
                    initial: { fill: "rgba(0,0,0,0)" },
                    hover: {
                        fill: ["rgba(0,0,0,0)", "currentColor", "rgba(0,0,0,0)"],
                        transition: { duration: 0.5, delay: 0.5 },
                    },
                    active: { fill: "currentColor" },
                }}
                initial="initial"
                animate={label}
            />
        </AnimatedSvg>
    );
};
