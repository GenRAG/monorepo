import { useEffect } from "react";

/** Toggles the node command palette on ⌘K / Ctrl+K, from anywhere on the page. */
export const useCommandPaletteKeyboard = (onToggle: () => void) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                onToggle();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onToggle]);
};
