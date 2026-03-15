import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const backendApi = createApi({
    reducerPath: "backendApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.REACT_APP_BACKEND_URL,
        credentials: "include",
    }),
    tagTypes: ["User", "Chat"],
    endpoints: () => ({}),
});
