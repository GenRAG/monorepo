import { motion, Variants } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";

/**
 * Approche choisie : (3) élément interne. Glyphe en aplat (carte pleine + bande) plutôt qu'en
 * contour. La bande magnétique (élément interne) glisse légèrement vers la droite au survol/à
 * l'activation, comme une carte qu'on insère/swipe dans un lecteur.
 */
const stripeVariants: Variants = {
    initial: { x: 0 },
    hover: { x: 2, transition: { duration: 0.3, ease: "easeOut" } },
    active: { x: 2, transition: { duration: 0.3, ease: "easeOut" } },
};

export const CreditCardIcon = ({ size = 20, isActive = false }: AnimatedIconProps) => {
    const { reduceMotion, label, hoverHandlers } = useIconAnimationState(isActive);

    const card = <rect x={2} y={5} width={20} height={14} rx={3} fill="currentColor" />;

    if (reduceMotion) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                {card}
                <rect x={5} y={9} width={7} height={3} rx={1} fill="currentColor" opacity={0.4} />
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hoverHandlers}>
            {card}
            <motion.rect
                x={5}
                y={9}
                width={7}
                height={3}
                rx={1}
                fill="currentColor"
                opacity={0.4}
                variants={stripeVariants}
                initial="initial"
                animate={label}
            />
        </svg>
    );
};
