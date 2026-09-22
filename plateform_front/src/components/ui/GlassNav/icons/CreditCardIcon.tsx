import { motion } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";
import { iconScaleVariants } from "./iconScaleVariants";

export const CreditCardIcon = ({ size = 20, isActive = false, isHovered }: AnimatedIconProps) => {
    const { reduceMotion, label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    const content = (
        <>
            <rect x={2} y={5} width={20} height={14} rx={3} fill="currentColor" />
            <rect x={5} y={9} width={7} height={3} rx={1} fill="currentColor" opacity={0.4} />
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
