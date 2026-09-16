import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SidebarLayoutMode = "auto" | "sidebar" | "bottombar";

const LAYOUT_MODE_STORAGE_KEY = "genrag:glassNavLayoutMode";

/**
 * "auto" laisse le breakpoint choisir (desktop = sidebar, mobile = bottom bar) — c'est le
 * comportement par défaut. "sidebar"/"bottombar" est un choix explicite de l'utilisateur (toggle
 * rapide près du nav, ou réglage dans Profil > Apparence) qui doit survivre au rechargement.
 */
const readStoredLayoutMode = (): SidebarLayoutMode => {
    try {
        const stored = localStorage.getItem(LAYOUT_MODE_STORAGE_KEY);
        return stored === "sidebar" || stored === "bottombar" ? stored : "auto";
    } catch {
        return "auto";
    }
};

interface NavigationState {
    lastWorkspaceId: string | null;
    sidebarLayoutMode: SidebarLayoutMode;
}

const navigationSlice = createSlice({
    name: "navigation",
    initialState: { lastWorkspaceId: null, sidebarLayoutMode: readStoredLayoutMode() } as NavigationState,
    reducers: {
        setLastWorkspaceId(state, action: PayloadAction<string>) {
            state.lastWorkspaceId = action.payload;
        },
        // La persistance localStorage se fait ici (et pas dans un thunk séparé) : c'est le seul
        // point d'écriture de cette préférence, la garder à côté de la mutation d'état évite de
        // pouvoir désynchroniser les deux.
        setSidebarLayoutMode(state, action: PayloadAction<SidebarLayoutMode>) {
            state.sidebarLayoutMode = action.payload;
            try {
                localStorage.setItem(LAYOUT_MODE_STORAGE_KEY, action.payload);
            } catch {
                // Stockage indisponible (navigation privée, quota...) : le choix ne survivra pas au refresh.
            }
        },
    },
});

export const { setLastWorkspaceId, setSidebarLayoutMode } = navigationSlice.actions;
export default navigationSlice.reducer;
