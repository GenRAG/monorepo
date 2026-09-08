import colors from "themeNew/foundations/colors";

export const DARK_THEME_ACCENT = "green";

// Source unique pour les couleurs de statut/marque utilisées hors Chakra (Chart.js, styles inline, SVG).
export const STATUS_COLORS = {
    success: colors.green[500],
    accent: colors.green[400],
    error: colors.red[500],
    warning: colors.orange[500],
} as const;

export const CHART_GREEN_SHADES = [colors.green[200], colors.green[400], colors.green[600], colors.green[800]] as const;

export const darkThemeColors = {
    green: {
        primary: "green.400",
        primary100: "green.100",
        primary200: "green.200",
        primary300: "green.300",
        primary400: "green.400",
        primary500: "green.500",
        primary600: "green.600",
        primary700: "green.700",
        primary800: "green.800",
        primary900: "green.900",
        rgba: {
            primary: "rgba(52, 211, 169, 1)",
            primary20: "rgba(52, 211, 169, 0.2)",
            primary30: "rgba(52, 211, 169, 0.3)",
        },
        completeColor: "rgba(52, 211, 168, 0.33)",
        hex: {
            primary: "#34D3A9",
        },
        colorScheme: "green",
    },
} as const;

export const currentDarkTheme = darkThemeColors[DARK_THEME_ACCENT];
