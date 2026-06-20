import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";
import {
    AuthResponse,
    ChangePasswordRequest,
    LoginParams,
    NewPasswordRequest,
    RegisterParams,
    ResendVerifyTokenRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    User,
    VerifyTokenRequest,
} from "types/user";

export const extendedUserApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginParams>({
            query: (body) => ({
                url: "/auth/login",
                method: "POST",
                body,
            }),
            invalidatesTags: [Tag.Users],
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
            providesTags: [Tag.Users],
        }),

        updateMe: builder.mutation<User, UpdateProfileRequest>({
            query: (body) => ({
                url: "/users/me",
                method: "PATCH",
                body,
            }),
            invalidatesTags: [Tag.Users],
        }),

        changePassword: builder.mutation<void, ChangePasswordRequest>({
            query: (body) => ({
                url: "/users/me/password",
                method: "PATCH",
                body,
            }),
        }),

        deleteMe: builder.mutation<void, void>({
            query: () => ({
                url: "/users/me",
                method: "DELETE",
            }),
            invalidatesTags: [Tag.Users],
        }),

        logoutUser: builder.mutation<void, void>({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyEmailTokenMutation,
    useResendEmailTokenMutation,
    useResetPasswordMutation,
    useApplyResetPasswordMutation,
    useGetMeQuery,
    useUpdateMeMutation,
    useChangePasswordMutation,
    useDeleteMeMutation,
    useLogoutUserMutation,
} = extendedUserApi;
