import { currentDarkTheme } from "./themeConfig";

const colorTokens = {
    // === INPUTS ===
    inputText: { default: "grey.900", _dark: "grey.100" },
    inputBorder: { default: "grey.100", _dark: "grey.700" },
    inputPlaceholder: { default: "grey.500", _dark: "grey.400" },
    inputActiveBorder: { default: "green.400", _dark: "green.400" },
    inputBg: { default: "white", _dark: "grey.950" },
    inputDisabledBg: { default: "grey.50", _dark: "grey.800" },

    // === TEXT ===
    textPrimary: { default: "grey.900", _dark: "grey.100" }, // Titres, texte principal
    textSecondary: { default: "grey.700", _dark: "grey.200" }, // Descriptions, sous-titres
    textLabel: { default: "grey.500", _dark: "grey.400" }, // Labels, icône+texte, méta
    textMuted: { default: "grey.400", _dark: "grey.600" }, // Optionnel, désactivé
    textSubtle: { default: "grey.300", _dark: "grey.500" }, // Très atténué, sous-descriptions

    // === SURFACES ===
    surfacePrimary: { default: "white", _dark: "grey.950" }, // Page principale
    surfaceCard: { default: "white", _dark: "grey.850" }, // Cartes
    surfaceModal: { default: "white", _dark: "grey.900" }, // Modales
    surfaceSubtle: { default: "grey.25", _dark: "grey.800" }, // Fond subtil, inputs désactivés
    surfaceHover: { default: "grey.50", _dark: "grey.900" }, // Survol de lignes/cartes
    surfaceThumbnail: { default: "grey.100", _dark: "grey.850" }, // Miniatures, avatars
    surfaceAction: { default: "white", _dark: "grey.800" }, // Bouton d'action secondaire
    tableBg: { default: "white", _dark: "transparent" },

    // === BORDERS ===
    borderSubtle: { default: "grey.100", _dark: "grey.700" }, // Bordure légère
    borderDefault: { default: "grey.100", _dark: "grey.800" }, // Bordure standard (cartes, séparateurs)
    borderStrong: { default: "grey.200", _dark: "grey.600" }, // Bordure marquée (kbd, inputs)
    borderDivider: { default: "grey.200", _dark: "grey.700" }, // Séparateurs de section

    // === SKELETON ===
    skeletonStart: { default: "grey.100", _dark: "grey.800" },
    skeletonEnd: { default: "grey.200", _dark: "grey.700" },

    // === ACCENTS ===
    accentCardBg: { default: "green.50", _dark: "grey.850" }, // Carte sélectionnée/active
    accentIconBg: { default: "green.100", _dark: "grey.800" }, // Fond icône accent

    darkAccent: { default: "grey.500", _dark: currentDarkTheme.primary },
    darkAccent500: { default: "grey.500", _dark: currentDarkTheme.primary500 },
    darkAccent900: { default: "grey.500", _dark: currentDarkTheme.primary900 },

    backgroundDefault: { default: "white", _dark: "grey.900" },
    secondBackgroundDefault: { default: "grey.25", _dark: "grey.950" },
};

export default colorTokens;
