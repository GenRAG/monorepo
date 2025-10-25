import { backendApi } from "services/api"

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

    verifyEmailToken: builder.mutation({
      query: (body) => ({
        url: "/auth/verification-token",
        method: "POST",
        body,
      }),
    }),

  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailTokenMutation,
} = extendedUserApi