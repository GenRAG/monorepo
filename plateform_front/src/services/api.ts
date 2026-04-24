import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Tag } from "services/tags/tag";

export const backendApi = createApi({
    reducerPath: "backendApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.REACT_APP_BACKEND_URL,
        credentials: "include",
    }),
    tagTypes: [Tag.Workspaces, Tag.Users, Tag.Documents, Tag.Agents, Tag.Chat, Tag.Workflow],
    endpoints: () => ({}),
});
