import { useCallback, useState } from "react";

export type ViewMode = "grid" | "table";

const readStored = (key: string, fallback: ViewMode): ViewMode => {
    try {
        const value = window.localStorage.getItem(key);
        return value === "grid" || value === "table" ? value : fallback;
    } catch {
        return fallback;
    }
};

/** Grid / table toggle remembered per browser (falls back silently when storage is unavailable). */
export const useViewModePreference = (key: string, fallback: ViewMode = "grid") => {
    const [viewMode, setViewModeState] = useState<ViewMode>(() => readStored(key, fallback));

    const setViewMode = useCallback(
        (mode: ViewMode) => {
            setViewModeState(mode);
            try {
                window.localStorage.setItem(key, mode);
            } catch {
                // Storage blocked: the choice only lasts for this visit.
            }
        },
        [key],
    );

    return [viewMode, setViewMode] as const;
};
