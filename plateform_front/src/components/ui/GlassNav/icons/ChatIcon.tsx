import { motion } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";
import { iconScaleVariants } from "./iconScaleVariants";

export const ChatIcon = ({ size = 20, isActive = false, isHovered }: AnimatedIconProps) => {
    const { reduceMotion, label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    const content = (
        <>
            <rect x={2} y={4} width={20} height={14} rx={6} fill="currentColor" />
            <polygon points="7,17 7,22 12,17" fill="currentColor" />
        </>
    );

    if (reduceMotion) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                {content}
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hoverHandlers}>
            <motion.g
                style={{ transformOrigin: "12px 12px" }}
                variants={iconScaleVariants}
                initial="initial"
                animate={label}
            >
                {content}
            </motion.g>
        </svg>
    );
};
