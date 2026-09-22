/** Convertit un hex "#RRGGBB" (issu du thème) en rgba() pour pouvoir lui donner de la transparence. */
export const hexToRgba = (hex: string, alpha: number): string => {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Éclaircit un hex "#RRGGBB" en mélangeant vers le blanc — pour dériver la couleur d'une carte à
 * partir de celle de son conteneur (ex: AgentCard légèrement plus clair que sa colonne de board),
 * plutôt qu'une couleur sans rapport avec le fond sur lequel la carte repose.
 * `amount` dans [0, 1] : 0 = couleur inchangée, 1 = blanc pur.
 */
export const lightenHex = (hex: string, amount: number): string => {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);

    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

export interface GlassInk {
    /** Texte/icône au premier plan (labels actifs). */
    text: string;
    /** Texte/icône secondaire (labels inactifs). */
    muted: string;
    /** Icônes des boutons utilitaires détachés (workspace, profil, bascule layout). */
    icon: string;
    /** Fond du pill actif derrière l'item sélectionné. */
    pillBg: string;
}

/**
 * Couleurs de premier plan à poser sur une `GlassSurface`, dérivées de son `variant` plutôt que du
 * colorMode de l'app (une GlassSurface "dark" reste lisible en blanc même si l'app est en light
 * mode, et inversement) — voir la note de `GlassSurfaceProps.variant`. Centralisé ici pour éviter
 * que `GlassNav` et `GlassNavAppExample` ne redéfinissent chacun leur propre ternaire `isDark`.
 */
export const getGlassInk = (variant: "dark" | "light"): GlassInk => {
    const isDark = variant === "dark";

    return {
        text: isDark ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 23, 42, 0.95)",
        muted: isDark ? "rgba(255, 255, 255, 0.55)" : "rgba(15, 23, 42, 0.5)",
        icon: isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(15, 23, 42, 0.85)",
        pillBg: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.05)",
    };
};
