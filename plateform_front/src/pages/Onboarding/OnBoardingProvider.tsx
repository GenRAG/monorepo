import useThemedToast from "hooks/useThemedToast";
import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useRef,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useStartOnboardingMutation,
    useUpdateOnboardingStepMutation,
    useCompleteOnboardingMutation,
} from "services/onboarding/onboarding";

export interface StepData {
    [key: string]: any;
}

export interface StepConfig {
    id: string;
    title: string;
    description: string;
    icon: any;
    component: React.ComponentType<StepComponentProps>;
    validate?: (data: StepData) => boolean | Promise<boolean>;
    onComplete?: (data: StepData) => void | Promise<void>;
}

export interface StepComponentProps {
    data: StepData;
    updateData: (data: Partial<StepData>) => void;
    goNext: () => void;
    goPrevious: () => void;
    isValid: boolean;
    registerValidateAndGoNext?: (fn: () => Promise<void>) => void;
}

export interface OnboardingState {
    currentStep: number;
    completedSteps: number[];
    stepsData: Record<string, StepData>;
}

interface OnboardingContextType {
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
    workspaceId: string;
    agentId: string;
    sessionId: string | null;
    isSessionLoading: boolean;
}

export const OnboardingContext = createContext<
    OnboardingContextType | undefined
>(undefined);

export const OnboardingProvider: React.FC<{
    children: ReactNode;
    steps: StepConfig[];
}> = ({ children, steps }) => {
    const toast = useThemedToast();
    const navigate = useNavigate();
    const { workspaceId: workspaceIdParam = "" } = useParams<{
        workspaceId: string;
    }>();

    const [state, setState] = useState<OnboardingState>({
        currentStep: 0,
        completedSteps: [],
        stepsData: {},
    });

    const [workspaceId, setWorkspaceId] = useState<string>(workspaceIdParam);
    const [agentId, setAgentId] = useState<string>("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState(true);
    const sessionInitialized = useRef(false);

    const [startOnboarding] = useStartOnboardingMutation();
    const [updateOnboardingStep] = useUpdateOnboardingStepMutation();
    const [completeOnboarding] = useCompleteOnboardingMutation();

    useEffect(() => {
        if (!workspaceIdParam || sessionInitialized.current) return;

        sessionInitialized.current = true;
        setWorkspaceId(workspaceIdParam);

        startOnboarding({ workspaceId: workspaceIdParam })
            .unwrap()
            .then((session) => {
                setAgentId(session.agentId);
                setSessionId(session.sessionId);
                setState((prev) => ({
                    ...prev,
                    currentStep: Math.max(prev.currentStep, session.step - 1),
                }));
            })
            .catch((err) => {
                console.error("Failed to initialize onboarding session:", err);
            })
            .finally(() => {
                setIsSessionLoading(false);
            });
    }, [workspaceIdParam, startOnboarding]);

    const updateStepData = (stepId: string, data: Partial<StepData>) => {
        setState((prev) => ({
            ...prev,
            stepsData: {
                ...prev.stepsData,
                [stepId]: { ...prev.stepsData[stepId], ...data },
            },
        }));
    };

    const getStepData = (stepId: string): StepData => {
        return state.stepsData[stepId] || {};
    };

    const isStepValid = (stepIndex: number): boolean => {
        const step = steps[stepIndex];
        if (!step.validate) return true;
        const result = step.validate(getStepData(step.id));
        if (result instanceof Promise) return false;
        return result;
    };

    const isStepCompleted = (stepIndex: number): boolean => {
        return state.completedSteps.includes(stepIndex);
    };

    const canNavigateToStep = (stepIndex: number): boolean => {
        if (stepIndex === 0) return true;
        for (let i = 0; i < stepIndex; i++) {
            if (!isStepCompleted(i)) return false;
        }
        return true;
    };

    const goToStep = (stepIndex: number) => {
        if (!canNavigateToStep(stepIndex)) return;
        setState((prev) => ({ ...prev, currentStep: stepIndex }));
    };

    const goNext = async () => {
        const currentStepConfig = steps[state.currentStep];

        if (currentStepConfig.validate) {
            const isValid = await currentStepConfig.validate(
                getStepData(currentStepConfig.id),
            );
            if (!isValid) {
                toast({
                    title: "An error occurred.",
                    description:
                        "Please complete the required fields before proceeding.",
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                });
                return;
            }
        }

        const isLastStep = state.currentStep === steps.length - 1;

        if (workspaceId) {
            if (isLastStep) {
                const style = getStepData("compare-intelligence")
                    .selectedLLM as
                    | "standard"
                    | "precise"
                    | "creative"
                    | undefined;
                if (style) {
                    try {
                        await completeOnboarding({
                            workspaceId,
                            style,
                        }).unwrap();
                    } catch (err) {
                        console.error("Failed to complete onboarding:", err);
                    }
                }
                await navigate("/dashboard");
                return;
            }

            // Sync step with backend (fire-and-forget)
            updateOnboardingStep({
                workspaceId,
                step: state.currentStep + 2,
            })
                .unwrap()
                .catch((err) =>
                    console.error("Failed to sync onboarding step:", err),
                );
        }

        setState((prev) => {
            const completedSteps = [...prev.completedSteps];
            if (!completedSteps.includes(prev.currentStep)) {
                completedSteps.push(prev.currentStep);
            }

            if (currentStepConfig.onComplete) {
                void currentStepConfig.onComplete(
                    prev.stepsData[currentStepConfig.id] || {},
                );
            }

            return {
                ...prev,
                completedSteps,
                currentStep: Math.min(prev.currentStep + 1, steps.length - 1),
            };
        });
    };

    const goPrevious = () => {
        setState((prev) => ({
            ...prev,
            currentStep: Math.max(prev.currentStep - 1, 0),
        }));
    };

    const resetOnboarding = () => {
        setState({ currentStep: 0, completedSteps: [], stepsData: {} });
    };

    return (
        <OnboardingContext.Provider
            value={{
                currentStep: state.currentStep,
                completedSteps: state.completedSteps,
                stepsData: state.stepsData,
                totalSteps: steps.length,
                goToStep,
                goNext,
                goPrevious,
                updateStepData,
                getStepData,
                isStepValid,
                isStepCompleted,
                canNavigateToStep,
                resetOnboarding,
                workspaceId,
                agentId,
                sessionId,
                isSessionLoading,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
};
