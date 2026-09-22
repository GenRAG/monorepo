import { Variants } from "framer-motion";

/** Animation partagée par toutes les icônes du nav : un simple scale sur l'icône entière, pas de
 * cascade par élément interne. */
export const iconScaleVariants: Variants = {
    initial: { scale: 1 },
    hover: { scale: 1.15, transition: { type: "spring", stiffness: 400, damping: 20 } },
    active: { scale: 1.08, transition: { type: "spring", stiffness: 400, damping: 20 } },
};
