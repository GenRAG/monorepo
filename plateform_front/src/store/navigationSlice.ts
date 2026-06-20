import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NavigationState {
    lastWorkspaceId: string | null;
}

const navigationSlice = createSlice({
    name: "navigation",
    initialState: { lastWorkspaceId: null } as NavigationState,
    reducers: {
        setLastWorkspaceId(state, action: PayloadAction<string>) {
            state.lastWorkspaceId = action.payload;
        },
    },
});

export const { setLastWorkspaceId } = navigationSlice.actions;
export default navigationSlice.reducer;
