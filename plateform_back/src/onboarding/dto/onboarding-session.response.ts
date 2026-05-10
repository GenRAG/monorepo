export class OnboardingSessionResponse {
    sessionId: string;
    agentId: string;
    step: number;
    completed: boolean;
    instruction: string | null;
}
