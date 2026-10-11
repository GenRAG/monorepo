/**
 * Palette du « verre dépoli » (GlassSurface, GlassNav, MultiOptionButtons, variante `glass` des inputs).
 * Source unique : des valeurs rgba brutes, sans hook, pour pouvoir servir aussi le thème Chakra.
 * "dark" = verre sombre (texte clair), "light" = verre clair (texte sombre). Les bases reprennent
 * grey.975 (#0B0E11) et grey.100 (#E7E7E7).
 */
export type GlassTone = "dark" | "light";

export const GLASS_BG: Record<GlassTone, string> = {
    dark: "rgba(11, 14, 17, 0.52)",
    light: "rgba(231, 231, 231, 0.62)",
};

export const GLASS_BORDER: Record<GlassTone, string> = {
    dark: "rgba(255, 255, 255, 0.14)",
    light: "rgba(15, 23, 42, 0.16)",
};

export const GLASS_BORDER_HOVER: Record<GlassTone, string> = {
    dark: "rgba(255, 255, 255, 0.28)",
    light: "rgba(15, 23, 42, 0.28)",
};

export const GLASS_INK = {
    dark: {
        text: "rgba(255, 255, 255, 0.95)",
        muted: "rgba(255, 255, 255, 0.55)",
        icon: "rgba(255, 255, 255, 0.85)",
        pillBg: "rgba(255, 255, 255, 0.08)",
    },
    light: {
        text: "rgba(15, 23, 42, 0.95)",
        muted: "rgba(15, 23, 42, 0.5)",
        icon: "rgba(15, 23, 42, 0.85)",
        pillBg: "rgba(15, 23, 42, 0.05)",
    },
} as const;

/** Pastille de l'option active, posée sur le verre. */
export const GLASS_ACTIVE_PILL: Record<GlassTone, string> = {
    dark: "rgba(255, 255, 255, 0.16)",
    light: "rgba(255, 255, 255, 0.95)",
};

/** Anneau de focus clavier (green.400) des éléments en verre. */
export const GLASS_FOCUS_RING = "0 0 0 2px rgba(52, 211, 169, 0.85)";
