import { useState } from "react";
import { useReducedMotion } from "framer-motion";

export type IconAnimationLabel = "initial" | "hover" | "active";

/**
 * État partagé par toutes les icônes animées du nav : combine le hover local de l'icône
 * (indépendant du hover Chakra du bouton parent, pour un contrôle précis des variants)
 * et l'état actif reçu en prop, en un seul label de variant framer-motion.
 *
 * Centralise aussi la lecture de `prefers-reduced-motion` : chaque icône peut ainsi se
 * contenter de vérifier `reduceMotion` pour retomber sur un rendu statique.
 */
export const useIconAnimationState = (isActive: boolean) => {
    const reduceMotion = Boolean(useReducedMotion());
    const [hovered, setHovered] = useState(false);

    const label: IconAnimationLabel = hovered ? "hover" : isActive ? "active" : "initial";

    return {
        reduceMotion,
        label,
        // Evénements DOM natifs (pas whileHover/onHoverStart de framer-motion) : la racine de
        // l'icône est un <svg> normal, pas systématiquement un motion.svg.
        hoverHandlers: {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
        },
    };
};
