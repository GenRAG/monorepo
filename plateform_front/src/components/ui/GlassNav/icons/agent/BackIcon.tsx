import { useId } from "react";
import { motion } from "framer-motion";
import { AnimatedIconProps } from "../types";
import { useIconAnimationState } from "../useIconAnimationState";
import { AnimatedSvg } from "../AnimatedSvg";

// Hover: the arrow leaves through the left edge and comes back in from the right, like a portal.
export const BackIcon = ({ size = 18, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);
    const clipId = useId();

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers} stroked>
            <defs>
                <clipPath id={clipId}>
                    <rect x={-4} y={0} width={23.5} height={24} />
                </clipPath>
            </defs>
            <path d="M21 4v16" opacity={0.5} />
            <g clipPath={`url(#${clipId})`}>
                <motion.g
                    variants={{
                        initial: { x: 0, opacity: 1 },
                        hover: {
                            x: [0, -9, 9, 0],
                            opacity: [1, 0, 0, 1],
                            transition: { duration: 0.6, times: [0, 0.4, 0.41, 1], ease: "easeInOut" },
                        },
                        active: { x: 0, opacity: 1 },
                    }}
                    initial="initial"
                    animate={label}
                >
                    <path d="M16 12H4" />
                    <path d="m9 7-5 5 5 5" />
                </motion.g>
            </g>
        </AnimatedSvg>
    );
};
