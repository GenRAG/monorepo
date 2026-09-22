import { useState } from "react";
import { useReducedMotion } from "framer-motion";

export type IconAnimationLabel = "initial" | "hover" | "active";

/**
 * État partagé par toutes les icônes animées du nav : combine le hover et l'état actif reçus en
 * props en un seul label de variant framer-motion.
 *
 * `isHovered` est contrôlé par le bouton parent (toute la zone cliquable, bien plus grande que
 * l'icône elle-même) — sans ça, le survol ne se déclenchait qu'en pointant exactement les ~20px
 * du glyphe. `hoverHandlers` reste exposé pour un fallback local (icône utilisée hors bouton),
 * mais n'a aucun effet tant que `isHovered` est fourni.
 *
 * Centralise aussi la lecture de `prefers-reduced-motion` : chaque icône peut ainsi se
 * contenter de vérifier `reduceMotion` pour retomber sur un rendu statique.
 */
export const useIconAnimationState = (isActive: boolean, isHovered?: boolean) => {
    const reduceMotion = Boolean(useReducedMotion());
    const [localHovered, setLocalHovered] = useState(false);
    const hovered = isHovered ?? localHovered;

    const label: IconAnimationLabel = hovered ? "hover" : isActive ? "active" : "initial";

    return {
        reduceMotion,
        label,
        hoverHandlers: {
            onMouseEnter: () => setLocalHovered(true),
            onMouseLeave: () => setLocalHovered(false),
        },
    };
};
