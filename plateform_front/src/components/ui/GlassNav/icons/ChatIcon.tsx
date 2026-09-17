import { motion, Variants } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";

/**
 * Approche choisie : (3) élément interne. Glyphe en aplat (bulle + queue pleines) plutôt qu'en
 * contour — un "tracé qui se dessine" (pathLength) n'a plus de sens sur une forme pleine. À la
 * place, la queue de la bulle (élément interne, indépendant du corps) oscille doucement en
 * boucle quand l'item est actif, comme une bulle "qui parle" ; léger rebond du corps au survol.
 */
const bubbleVariants: Variants = {
    initial: { scale: 1 },
    hover: { scale: [1, 1.06, 1], transition: { duration: 0.35, ease: "easeOut" } },
    active: { scale: 1 },
};

const tailVariants: Variants = {
    initial: { rotate: 0 },
    hover: { rotate: 0 },
    active: {
        rotate: [-6, 6, -6],
        transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
};

export const ChatIcon = ({ size = 20, isActive = false }: AnimatedIconProps) => {
    const { reduceMotion, label, hoverHandlers } = useIconAnimationState(isActive);

    if (reduceMotion) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <rect x={2} y={4} width={20} height={14} rx={6} fill="currentColor" />
                <polygon points="7,17 7,22 12,17" fill="currentColor" />
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hoverHandlers}>
            <motion.rect
                x={2}
                y={4}
                width={20}
                height={14}
                rx={6}
                fill="currentColor"
                style={{ transformOrigin: "12px 11px" }}
                variants={bubbleVariants}
                initial="initial"
                animate={label}
            />
            <motion.polygon
                points="7,17 7,22 12,17"
                fill="currentColor"
                style={{ transformOrigin: "7px 17px" }}
                variants={tailVariants}
                initial="initial"
                animate={label}
            />
        </svg>
    );
};
