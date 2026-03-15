import { currentDarkTheme } from "./themeConfig";

const colorTokens = {
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
    textPrimary: {
        default: "grey.900",
        _dark: "grey.100",
    },
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
