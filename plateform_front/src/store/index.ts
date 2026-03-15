import { configureStore } from "@reduxjs/toolkit";
import { backendApi } from "services/api";
import "services/agent/agent";

export const store = configureStore({
    reducer: {
        [backendApi.reducerPath]: backendApi.reducer,
    },
    middleware: (getDefaultMiddleware: () => any) =>
        getDefaultMiddleware().concat(backendApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
