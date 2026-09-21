import { motion } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";
import { iconScaleVariants } from "./iconScaleVariants";

export const FolderIcon = ({ size = 20, isActive = false, isHovered }: AnimatedIconProps) => {
    const { reduceMotion, label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    const content = (
        <>
            <rect x={3} y={7} width={18} height={13} rx={2.5} fill="currentColor" />
            <rect x={5} y={4} width={7} height={4} rx={1.2} fill="currentColor" opacity={0.75} />
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
