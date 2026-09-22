import { motion } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";
import { iconScaleVariants } from "./iconScaleVariants";

const TILES = [
    { x: 3, y: 3 },
    { x: 13, y: 3 },
    { x: 3, y: 13 },
    { x: 13, y: 13 },
];

export const DashboardIcon = ({ size = 20, isActive = false, isHovered }: AnimatedIconProps) => {
    const { reduceMotion, label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    const tiles = TILES.map((tile) => (
        <rect
            key={`${tile.x}-${tile.y}`}
            x={tile.x}
            y={tile.y}
            width={8}
            height={8}
            rx={2}
            fill="currentColor"
            opacity={0.9}
        />
    ));

    if (reduceMotion) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                {tiles}
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
                {tiles}
            </motion.g>
        </svg>
    );
};
