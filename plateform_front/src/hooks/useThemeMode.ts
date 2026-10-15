import { useCallback, useState } from "react";
import { useColorMode } from "@chakra-ui/react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "themeMode";

const readStoredMode = (fallback: ThemeMode): ThemeMode => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === "light" || stored === "dark" || stored === "system" ? stored : fallback;
    } catch {
        return fallback;
    }
};

/** Thème choisi (clair, sombre ou celui du système), partagé par le menu de la sidebar et Profil > Apparence. */
export const useThemeMode = () => {
    const { colorMode, setColorMode } = useColorMode();
    const [themeMode, setThemeModeState] = useState<ThemeMode>(() => readStoredMode(colorMode));

    // shortcut: "system" applique le thème du système au moment du choix, sans suivre ses changements ensuite.
    const setThemeMode = useCallback(
        (mode: ThemeMode) => {
            setThemeModeState(mode);
            try {
                localStorage.setItem(STORAGE_KEY, mode);
            } catch {
                /* préférence non persistée, le thème s'applique quand même */
            }
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setColorMode(mode === "system" ? (prefersDark ? "dark" : "light") : mode);
        },
        [setColorMode],
    );

    return { themeMode, setThemeMode };
};
