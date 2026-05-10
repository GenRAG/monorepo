import { backendApi } from "services/api";
import { Tag } from "services/tags/tag";

export interface OnboardingSession {
    sessionId: string;
    agentId: string;
    step: number;
    completed: boolean;
    instruction: string | null;
    stepsData: Record<string, Record<string, unknown>>;
}

export interface CompareOnboardingResponse {
    standard: string;
    precise: string;
    creative: string;
}

interface StartOnboardingParams {
    workspaceId: string;
}

interface UpdateStepParams {
    workspaceId: string;
    step: number;
}

interface UpdateStepsDataParams {
    workspaceId: string;
    stepId: string;
    data: Record<string, unknown>;
}

interface CompareOnboardingParams {
    workspaceId: string;
    query: string;
}

interface CompleteOnboardingParams {
    workspaceId: string;
    style: "standard" | "precise" | "creative";
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

        updateOnboardingStepsData: builder.mutation<
            void,
            UpdateStepsDataParams
        >({
            query: ({ workspaceId, stepId, data }) => ({
                url: `/workspaces/${workspaceId}/onboarding/steps-data`,
                method: "POST",
                body: { stepId, data },
            }),
        }),

        compareOnboarding: builder.mutation<
            CompareOnboardingResponse,
            CompareOnboardingParams
        >({
            query: ({ workspaceId, query }) => ({
                url: `/workspaces/${workspaceId}/onboarding/compare`,
                method: "POST",
                body: { query },
            }),
        }),

        completeOnboarding: builder.mutation<void, CompleteOnboardingParams>({
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
    useUpdateOnboardingStepsDataMutation,
    useCompareOnboardingMutation,
    useCompleteOnboardingMutation,
} = onboardingApi;
