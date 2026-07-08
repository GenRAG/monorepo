import { createApi, fetchBaseQuery, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { Tag } from "services/tags/tag";

const BACKEND_TAG_TYPES = [
    Tag.Workspaces,
    Tag.Users,
    Tag.Documents,
    Tag.Agents,
    Tag.Chat,
    Tag.Workflow,
    Tag.Deployments,
    Tag.Onboarding,
    Tag.Credits,
    Tag.AgentMembers,
] as const;

const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL,
    credentials: "include",
});

// The backend's global exception filter wraps errors as { statusCode, timestamp, path, error: {...} }.
// Unwrap `error` back into `data` so call sites can keep reading `err.data.message` directly.
const baseQueryWithErrorUnwrap: BaseQueryFn = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

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
