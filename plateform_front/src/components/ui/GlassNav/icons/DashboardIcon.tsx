import { motion, Variants } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";

/**
 * Approche choisie : (3) animation d'éléments internes.
 * Un dashboard n'a pas d'état "ouvert/fermé" sémantique évident à faire morpher — donc plutôt
 * que de bouger l'icône entière, on fait "respirer" les 4 tuiles de la grille en cascade,
 * comme des widgets qui se rafraîchissent. Ça vend l'idée de "tableau de bord vivant".
 */
const TILES = [
    { x: 3, y: 3 },
    { x: 13, y: 3 },
    { x: 3, y: 13 },
    { x: 13, y: 13 },
];

const tileVariants: Variants = {
    initial: { scale: 1, opacity: 0.9 },
    hover: (i: number) => ({
        scale: [1, 0.8, 1],
        opacity: [0.9, 1, 0.9],
        transition: { duration: 0.55, delay: i * 0.07, ease: "easeInOut" },
    }),
    active: (i: number) => ({
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 420, damping: 22, delay: i * 0.04 },
    }),
};

export const DashboardIcon = ({ size = 20, isActive = false }: AnimatedIconProps) => {
    const { reduceMotion, label, hoverHandlers } = useIconAnimationState(isActive);

    if (reduceMotion) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                {TILES.map((tile) => (
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
                ))}
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hoverHandlers}>
            {TILES.map((tile, i) => (
                <motion.rect
                    key={`${tile.x}-${tile.y}`}
                    x={tile.x}
                    y={tile.y}
                    width={8}
                    height={8}
                    rx={2}
                    fill="currentColor"
                    custom={i}
                    variants={tileVariants}
                    initial="initial"
                    animate={label}
                />
            ))}
        </svg>
    );
};
