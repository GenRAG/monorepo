import { currentDarkTheme } from "./themeConfig";

const colorTokens = {
    // Inputs
    inputText: {
        default: "grey.900",
        _dark: "grey.100",
    },
    inputBorder: {
        default: "grey.100",
        _dark: "grey.400",
    },
    inputPlaceholder: {
        default: "grey.500",
        _dark: "grey.400",
    },
    inputActiveBorder: {
        default: "grey.900",
        _dark: "white",
    },

    // Text
    textPrimary: {
        default: "grey.900",
        _dark: "grey.100",
    },
    textSecondary: {
        default: "grey.600",
        _dark: "grey.400",
    },
    textMuted: {
        default: "grey.700",
        _dark: "grey.200",
    },

    // Surfaces
    surfacePrimary: {
        default: "white",
        _dark: "grey.950",
    },
    surfaceModal: {
        default: "white",
        _dark: "grey.900",
    },
    surfaceSubtle: {
        default: "grey.50",
        _dark: "grey.800",
    },
    tableBg: {
        default: "white",
        _dark: "transparent",
    },

    // Borders
    borderSubtle: {
        default: "grey.100",
        _dark: "grey.700",
    },
    borderDefault: {
        default: "grey.200",
        _dark: "grey.700",
    },

    // Accents
    darkAccent: {
        default: "grey.500",
        _dark: currentDarkTheme.primary,
    },
    darkAccent500: {
        default: "grey.500",
        _dark: currentDarkTheme.primary500,
    },
    darkAccent900: {
        default: "grey.500",
        _dark: currentDarkTheme.primary900,
    },
};

export default colorTokens;
