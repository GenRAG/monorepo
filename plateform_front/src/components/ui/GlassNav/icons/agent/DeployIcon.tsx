import { useId } from "react";
import { motion } from "framer-motion";
import { AnimatedIconProps } from "../types";
import { useIconAnimationState } from "../useIconAnimationState";
import { AnimatedSvg } from "../AnimatedSvg";

const CLOUD = "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z";

// Deployment: the arrow lifts off and fades out, and a new one rises from the bottom of the cloud. It is
// clipped to the cloud, so it never crosses the outline.
export const DeployIcon = ({ size = 18, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);
    const clipId = useId();

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers} stroked>
            <defs>
                <clipPath id={clipId}>
                    <path d={CLOUD} />
                </clipPath>
            </defs>
            <path d={CLOUD} />
            <g clipPath={`url(#${clipId})`}>
                <motion.g
                    variants={{
                        initial: { y: 0, opacity: 1 },
                        hover: {
                            y: [0, -4, 7, 0],
                            opacity: [1, 0, 0, 1],
                            transition: { duration: 0.8, times: [0, 0.35, 0.36, 1], ease: "easeInOut" },
                        },
                        active: { y: -1, opacity: 1 },
                    }}
                    initial="initial"
                    animate={label}
                >
                    <path d="M12 17.5v-5" />
                    <path d="m9.8 14.7 2.2-2.2 2.2 2.2" />
                </motion.g>
            </g>
        </AnimatedSvg>
    );
};
