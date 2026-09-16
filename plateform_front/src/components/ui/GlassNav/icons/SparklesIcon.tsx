import { motion, Variants } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";

/**
 * Approche choisie : (3) éléments internes. Une icône "IA/assistant" n'a pas d'état fermé/ouvert
 * à représenter — l'objectif est purement de suggérer de la "magie" en continu : l'étoile
 * principale et les deux petites étincelles tournent/pulsent en boucle avec un décalage,
 * uniquement pendant le survol/l'activation (pas de boucle infinie au repos).
 */
const mainVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
        scale: [1, 1.12, 1],
        rotate: [0, 8, 0],
        transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
    active: {
        scale: [1, 1.12, 1],
        rotate: [0, 8, 0],
        transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
};

const smallVariants: Variants = {
    initial: { opacity: 0.6, scale: 1 },
    hover: (delay: number) => ({
        opacity: [0.6, 1, 0.6],
        scale: [1, 1.3, 1],
        transition: { duration: 1.2, repeat: Infinity, delay, ease: "easeInOut" },
    }),
    active: (delay: number) => ({
        opacity: [0.6, 1, 0.6],
        scale: [1, 1.3, 1],
        transition: { duration: 1.2, repeat: Infinity, delay, ease: "easeInOut" },
    }),
};

export const SparklesIcon = ({ size = 20, isActive = false }: AnimatedIconProps) => {
    const { reduceMotion, label, hoverHandlers } = useIconAnimationState(isActive);

    const mainStar = <polygon points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10" fill="currentColor" />;
    const spark = (x: number, y: number, s: number) => (
        <polygon points={`${x},${y - s} ${x + s * 0.35},${y} ${x},${y + s} ${x - s * 0.35},${y}`} fill="currentColor" />
    );

    if (reduceMotion) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                {mainStar}
                {spark(20, 5, 2.6)}
                {spark(4, 19, 2.2)}
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hoverHandlers}>
            <motion.g
                style={{ transformOrigin: "12px 12px" }}
                variants={mainVariants}
                initial="initial"
                animate={label}
            >
                {mainStar}
            </motion.g>
            <motion.g
                style={{ transformOrigin: "20px 5px" }}
                custom={0}
                variants={smallVariants}
                initial="initial"
                animate={label}
            >
                {spark(20, 5, 2.6)}
            </motion.g>
            <motion.g
                style={{ transformOrigin: "4px 19px" }}
                custom={0.25}
                variants={smallVariants}
                initial="initial"
                animate={label}
            >
                {spark(4, 19, 2.2)}
            </motion.g>
        </svg>
    );
};
