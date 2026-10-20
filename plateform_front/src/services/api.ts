import { createApi, fetchBaseQuery, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { Tag } from "services/tags/tag";

const BACKEND_TAG_TYPES = [
    Tag.Workspaces,
    Tag.Users,
    Tag.Documents,
    Tag.Datasets,
    Tag.Agents,
    Tag.Chat,
    Tag.Workflow,
    Tag.Deployments,
    Tag.Onboarding,
    Tag.Credits,
    Tag.AgentMembers,
    Tag.Analytics,
] as const;

const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL,
    credentials: "include",
});

// The backend's global exception filter wraps errors as { statusCode, timestamp, path, error: {...} }.
// Unwrap `error` back into `data` so call sites can keep reading `err.data.message` directly.
const baseQueryWithErrorUnwrap: BaseQueryFn = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    // A 401 outside the auth routes means the session is over (JWT expired, logout in another tab): refetch the user, so
    // the app sees it is logged out and PrivateRoute sends it to /login. Never for /users/me itself, which would loop.
    if (result.error?.status === 401) {
        const url = typeof args === "string" ? args : args.url;
        if (!url.startsWith("/auth/") && url !== "/users/me") {
            api.dispatch(backendApi.util.invalidateTags([Tag.Users]));
        }
    }

    if (result.error && result.error.data && typeof result.error.data === "object" && "error" in result.error.data) {
        const { error: innerError } = result.error.data as { error: unknown };
        return { ...result, error: { ...result.error, data: innerError } };
    }

    return result;
};

export const backendApi = createApi({
    reducerPath: "backendApi",
    baseQuery: baseQueryWithErrorUnwrap,
    tagTypes: BACKEND_TAG_TYPES,
    endpoints: () => ({}),
});
