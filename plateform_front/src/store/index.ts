import { configureStore } from "@reduxjs/toolkit";
import { backendApi } from "services/api";

export const store = configureStore({
    reducer: {
        [backendApi.reducerPath]: backendApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(backendApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
