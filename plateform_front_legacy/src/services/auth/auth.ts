import { backendApi } from "@/src/services/api"

export const extendedUserApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation } = extendedUserApi