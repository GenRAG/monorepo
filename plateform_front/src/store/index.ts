import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { backendApi } from "services/api";
// Each service file registers its endpoints via backendApi.injectEndpoints() as a module side
// effect — importing them all here guarantees registration regardless of which components a given
// bundle actually renders (component imports alone would work too, but are an implicit, fragile
// dependency on every endpoint being used somewhere in the render tree).
import "services/agent/agent";
import "services/agent/agentMembers";
import "services/agentRuntime/agentRuntime";
import "services/analytics/analytics";
import "services/auth/auth";
import "services/chat/chat";
import "services/credit/credit";
import "services/deployment/deployment";
import "services/document/document";
import "services/models/models";
import "services/onboarding/onboarding";
import "services/workflow/workflow";
import "services/workspace/workspace";
import navigationReducer from "./navigationSlice";

export const store = configureStore({
    reducer: {
        [backendApi.reducerPath]: backendApi.reducer,
        navigation: navigationReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(backendApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);
