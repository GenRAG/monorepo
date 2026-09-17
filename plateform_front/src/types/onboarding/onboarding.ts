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
