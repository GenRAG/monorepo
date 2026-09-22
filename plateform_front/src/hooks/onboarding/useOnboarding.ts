import { createContext, useContext } from "react";

export interface StepData {
    [key: string]: unknown;
}

export type SessionError = "not_found" | "unauthorized" | "unknown";

export interface OnboardingContextType {
    currentStep: number;
    completedSteps: number[];
    stepsData: Record<string, StepData>;
    totalSteps: number;
    goToStep: (step: number) => void;
    goNext: () => void;
    goPrevious: () => void;
    updateStepData: (stepId: string, data: Partial<StepData>) => void;
    getStepData: (stepId: string) => StepData;
    isStepValid: (stepIndex: number) => boolean;
    isStepCompleted: (stepIndex: number) => boolean;
    canNavigateToStep: (stepIndex: number) => boolean;
    resetOnboarding: () => void;
    skip: () => Promise<void>;
    workspaceId: string;
    agentId: string;
    sessionId: string | null;
    isSessionLoading: boolean;
    sessionError: SessionError | null;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within OnboardingProvider");
    }
    return context;
};
