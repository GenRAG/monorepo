import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { OnboardingContext, type StepData } from "hooks/onboarding/useOnboarding";
import { useOnboardingState } from "pages/Onboarding/useOnboardingState";

export interface StepConfig {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    component: React.ComponentType<StepComponentProps>;
    validate?: (data: StepData) => boolean | Promise<boolean>;
    errorMessage?: string;
}

export interface StepComponentProps {
    data: StepData;
    updateData: (data: Partial<StepData>) => void;
    goNext: () => void;
    goPrevious: () => void;
    isValid: boolean;
}

export interface OnboardingState {
    currentStep: number;
    completedSteps: number[];
    stepsData: Record<string, StepData>;
}

export const OnboardingProvider: React.FC<{
    children: ReactNode;
    steps: StepConfig[];
}> = ({ children, steps }) => {
    const value = useOnboardingState(steps);

    return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
