import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";

export interface OnboardingSession {
    sessionId: string;
    agentId: string;
    step: number;
    completed: boolean;
    instruction: string | null;
}

interface StartOnboardingParams {
    workspaceId: string;
}

interface UpdateStepParams {
    workspaceId: string;
    step: number;
}

interface CompleteOnboardingParams {
    workspaceId: string;
    style: "standard" | "precise" | "creative";
}

interface CompleteOnboardingResponse {
    success: boolean;
    instruction: string;
}

const onboardingTag = (workspaceId: string) => ({
    type: Tag.Onboarding as const,
    id: workspaceId,
});

export const onboardingApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        startOnboarding: builder.mutation<
            OnboardingSession,
            StartOnboardingParams
        >({
            query: ({ workspaceId }) => ({
                url: `/workspaces/${workspaceId}/onboarding/start`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, { workspaceId }) => [
                onboardingTag(workspaceId),
            ],
        }),

        getOnboardingSession: builder.query<OnboardingSession | null, string>({
            query: (workspaceId) => ({
                url: `/workspaces/${workspaceId}/onboarding/session`,
                method: "GET",
            }),
            providesTags: (_result, _error, workspaceId) => [
                onboardingTag(workspaceId),
            ],
        }),

        updateOnboardingStep: builder.mutation<
            OnboardingSession,
            UpdateStepParams
        >({
            query: ({ workspaceId, step }) => ({
                url: `/workspaces/${workspaceId}/onboarding/step`,
                method: "POST",
                body: { step },
            }),
            invalidatesTags: (_result, _error, { workspaceId }) => [
                onboardingTag(workspaceId),
            ],
        }),

        completeOnboarding: builder.mutation<
            CompleteOnboardingResponse,
            CompleteOnboardingParams
        >({
            query: ({ workspaceId, style }) => ({
                url: `/workspaces/${workspaceId}/onboarding/complete`,
                method: "POST",
                body: { style },
            }),
            invalidatesTags: (_result, _error, { workspaceId }) => [
                onboardingTag(workspaceId),
            ],
        }),
    }),
});

export const {
    useStartOnboardingMutation,
    useGetOnboardingSessionQuery,
    useUpdateOnboardingStepMutation,
    useCompleteOnboardingMutation,
} = onboardingApi;
