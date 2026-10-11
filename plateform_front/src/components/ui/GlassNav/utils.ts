import { GLASS_INK, type GlassTone } from "themeNew/foundations/glass";

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

export type GlassInk = (typeof GLASS_INK)[GlassTone];

/**
 * Couleurs de premier plan à poser sur une `GlassSurface`, dérivées de son `variant` plutôt que du
 * colorMode de l'app (une GlassSurface "dark" reste lisible en blanc même si l'app est en light
 * mode, et inversement) — voir la note de `GlassSurfaceProps.variant`.
 */
export const getGlassInk = (variant: GlassTone): GlassInk => GLASS_INK[variant];
