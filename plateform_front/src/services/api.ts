import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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
] as const;

export const backendApi = createApi({
    reducerPath: "backendApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.REACT_APP_BACKEND_URL,
        credentials: "include",
    }),
    tagTypes: BACKEND_TAG_TYPES,
    endpoints: () => ({}),
});
