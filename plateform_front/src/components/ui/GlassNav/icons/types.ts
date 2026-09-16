export interface AnimatedIconProps {
    /** Taille en px (largeur = hauteur, viewBox 24x24). */
    size?: number;
    /** Item actif : déclenche/maintient l'état "active" des variants framer-motion de l'icône. */
    isActive?: boolean;
}
