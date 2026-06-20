import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { createReduxEnhancer } from "@sentry/react";
import { backendApi } from "services/api";
import "services/agent/agent";
import navigationReducer from "./navigationSlice";

export const store = configureStore({
    reducer: {
        [backendApi.reducerPath]: backendApi.reducer,
        navigation: navigationReducer,
    },
    middleware: (getDefaultMiddleware: () => any) => getDefaultMiddleware().concat(backendApi.middleware),
    enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(createReduxEnhancer()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);
