import { verify } from "crypto"
import ResetPassword from "pages/Auth/Password"
import { backendApi } from "services/api"
import { AuthResponse, LoginParams, NewPasswordRequest, RegisterParams, ResendVerifyTokenRequest, ResetPasswordRequest, User, VerifyTokenRequest } from "types/user"

export const extendedUserApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation<AuthResponse, LoginParams>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<void, RegisterParams>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    verifyEmailToken: builder.mutation<AuthResponse, VerifyTokenRequest>({
      query: (body) => ({
        url: "/auth/verification-token",
        method: "POST",
        body,
      }),
    }),

    resendEmailToken: builder.mutation<void, ResendVerifyTokenRequest>({
      query: (body) => ({
        url: "/auth/resend-verification-token",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    applyResetPassword: builder.mutation<void, NewPasswordRequest>({
      query: (body) => ({
        url: "/auth/verify-password-reset-token",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<User, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ['User'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailTokenMutation,
  useResendEmailTokenMutation,
  useResetPasswordMutation,
  useApplyResetPasswordMutation,
  useGetMeQuery,
} = extendedUserApi