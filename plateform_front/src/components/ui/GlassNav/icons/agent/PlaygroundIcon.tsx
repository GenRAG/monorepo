import { motion } from "framer-motion";
import { AnimatedIconProps } from "../types";
import { useIconAnimationState } from "../useIconAnimationState";
import { AnimatedSvg } from "../AnimatedSvg";

const DOTS = [8, 12, 16];

// Test & chat: typing dots pop into the bubble and wave while hovered.
export const PlaygroundIcon = ({ size = 18, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers} stroked>
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            {DOTS.map((cx, index) => (
                <motion.circle
                    key={cx}
                    cx={cx}
                    cy={12}
                    r={1.1}
                    fill="currentColor"
                    stroke="none"
                    variants={{
                        initial: { opacity: 0, y: 0 },
                        hover: {
                            opacity: 1,
                            y: [0, -2, 0],
                            transition: {
                                opacity: { duration: 0.1, delay: index * 0.06 },
                                y: { duration: 0.55, repeat: Infinity, delay: index * 0.12, ease: "easeInOut" },
                            },
                        },
                        active: { opacity: 1, y: 0 },
                    }}
                    initial="initial"
                    animate={label}
                />
            ))}
        </AnimatedSvg>
    );
};
