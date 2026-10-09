import { motion, type Variants } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";
import { AnimatedSvg } from "./AnimatedSvg";

// Tiles in clockwise order; on hover each one slides into the next slot, like a sliding puzzle.
const TILES = [
    { x: 3, y: 3, to: { x: 10, y: 0 } },
    { x: 13, y: 3, to: { x: 0, y: 10 } },
    { x: 13, y: 13, to: { x: -10, y: 0 } },
    { x: 3, y: 13, to: { x: 0, y: -10 } },
];

const tileVariants = (to: { x: number; y: number }, index: number): Variants => ({
    initial: { x: 0, y: 0, rx: 2 },
    hover: {
        x: [0, to.x, to.x],
        y: [0, to.y, to.y],
        transition: { duration: 0.5, times: [0, 0.7, 1], ease: [0.65, 0, 0.35, 1] },
    },
    // Active: the top-left tile turns into a dot, the "you are here" marker.
    active: { x: 0, y: 0, rx: index === 0 ? 4 : 2, transition: { type: "spring", stiffness: 300, damping: 20 } },
});

export const DashboardIcon = ({ size = 20, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers}>
            {TILES.map((tile, index) => (
                <motion.rect
                    key={index}
                    x={tile.x}
                    y={tile.y}
                    width={8}
                    height={8}
                    rx={2}
                    fill="currentColor"
                    opacity={0.9}
                    variants={tileVariants(tile.to, index)}
                    initial="initial"
                    animate={label}
                />
            ))}
        </AnimatedSvg>
    );
};
