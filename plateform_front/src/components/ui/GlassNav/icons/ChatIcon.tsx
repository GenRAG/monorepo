import { useId } from "react";
import { motion } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";
import { AnimatedSvg } from "./AnimatedSvg";

const DOTS = [8, 12, 16];

// Hover: "someone is typing" dots, cut out of the bubble, ripple one after the other.
export const ChatIcon = ({ size = 20, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);
    const maskId = useId();

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers}>
            <defs>
                <mask id={maskId}>
                    <rect x={2} y={4} width={20} height={14} rx={6} fill="white" />
                    <polygon points="7,17 7,22 12,17" fill="white" />
                    {DOTS.map((cx, index) => (
                        <motion.circle
                            key={cx}
                            cx={cx}
                            cy={11}
                            r={1.6}
                            fill="black"
                            variants={{
                                initial: { r: 0, y: 0 },
                                hover: {
                                    r: 1.6,
                                    y: [0, -2.2, 0],
                                    transition: {
                                        r: { duration: 0.15, delay: index * 0.05 },
                                        y: { duration: 0.6, repeat: Infinity, delay: index * 0.12, ease: "easeInOut" },
                                    },
                                },
                                active: { r: 1.3, y: 0, transition: { duration: 0.2, delay: index * 0.05 } },
                            }}
                            initial="initial"
                            animate={label}
                        />
                    ))}
                </mask>
            </defs>
            <motion.g
                mask={`url(#${maskId})`}
                style={{ transformOrigin: "7px 20px" }}
                variants={{
                    initial: { rotate: 0 },
                    hover: { rotate: [0, -6, 3, 0], transition: { duration: 0.5 } },
                    active: { rotate: 0 },
                }}
                initial="initial"
                animate={label}
            >
                <rect x={2} y={4} width={20} height={14} rx={6} fill="currentColor" />
                <polygon points="7,17 7,22 12,17" fill="currentColor" />
            </motion.g>
        </AnimatedSvg>
    );
};
