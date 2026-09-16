import { motion, Variants } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";

/**
 * Approche choisie : (1) transformation d'état fermé → ouvert, appliquée à une sous-partie du
 * tracé plutôt qu'à un morph de `d`. Le corps du dossier reste statique (repère visuel stable),
 * seul l'onglet du haut pivote autour de sa base, comme un onglet de classeur qu'on soulève.
 * On évite le morph de `d` ici : les deux tracés (fermé/ouvert) n'ont pas le même nombre de
 * points, l'interpolation de chaîne de framer-motion aurait donc un rendu heurté.
 *
 * Glyphe en aplat (fill), pas en contour : les icônes du nav suivent un style plein, pas le
 * style outline de lucide utilisé ailleurs dans l'app.
 */
const tabVariants: Variants = {
    initial: { rotate: 0 },
    hover: { rotate: -16, transition: { type: "spring", stiffness: 300, damping: 14 } },
    active: { rotate: -8, transition: { type: "spring", stiffness: 380, damping: 18 } },
};

export const FolderIcon = ({ size = 20, isActive = false }: AnimatedIconProps) => {
    const { reduceMotion, label, hoverHandlers } = useIconAnimationState(isActive);

    const body = <rect x={3} y={7} width={18} height={13} rx={2.5} fill="currentColor" />;

    if (reduceMotion) {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                {body}
                <rect x={5} y={4} width={7} height={4} rx={1.2} fill="currentColor" opacity={0.75} />
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...hoverHandlers}>
            {body}
            <motion.rect
                x={5}
                y={4}
                width={7}
                height={4}
                rx={1.2}
                fill="currentColor"
                opacity={0.75}
                style={{ transformOrigin: "5px 8px" }}
                variants={tabVariants}
                initial="initial"
                animate={label}
            />
        </svg>
    );
};
