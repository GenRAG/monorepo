import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useThemedToast from "hooks/useThemedToast";
import {
    useStartOnboardingMutation,
    useUpdateOnboardingStepMutation,
    useCompleteOnboardingMutation,
    useSkipOnboardingMutation,
} from "services/onboarding/onboarding";
import type { StepData, SessionError } from "hooks/onboarding/useOnboarding";
import type { StepConfig, OnboardingState } from "pages/Onboarding/OnBoardingProvider";

export const useOnboardingState = (steps: StepConfig[]) => {
    const toast = useThemedToast();
    const navigate = useNavigate();
    const { workspaceId = "" } = useParams<{ workspaceId: string }>();

    const [state, setState] = useState<OnboardingState>({
        currentStep: 0,
        completedSteps: [],
        stepsData: {},
    });

    const [agentId, setAgentId] = useState<string>("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState(true);
    const [sessionError, setSessionError] = useState<SessionError | null>(null);
    const sessionInitialized = useRef(false);

    const [startOnboarding] = useStartOnboardingMutation();
    const [updateOnboardingStep] = useUpdateOnboardingStepMutation();
    const [completeOnboarding] = useCompleteOnboardingMutation();
    const [skipOnboarding] = useSkipOnboardingMutation();

    useEffect(() => {
        if (!workspaceId || sessionInitialized.current) return;

        sessionInitialized.current = true;

        startOnboarding({ workspaceId })
            .unwrap()
            .then((session) => {
                setAgentId(session.agentId);
                setSessionId(session.sessionId);
                setState((prev) => ({
                    ...prev,
                    currentStep: Math.min(Math.max(prev.currentStep, session.step - 1), steps.length - 1),
                    stepsData: session.stepsData ?? prev.stepsData,
                }));
            })
            .catch((err) => {
                const status = err?.status ?? err?.originalStatus;
                if (status === 404) {
                    setSessionError("not_found");
                } else if (status === 403 || status === 401) {
                    setSessionError("unauthorized");
                } else {
                    setSessionError("unknown");
                }
            })
            .finally(() => {
                setIsSessionLoading(false);
            });
    }, [workspaceId, startOnboarding, navigate, steps.length]);

    const updateStepData = useCallback((stepId: string, data: Partial<StepData>) => {
        setState((prev) => ({
            ...prev,
            stepsData: {
                ...prev.stepsData,
                [stepId]: { ...prev.stepsData[stepId], ...data },
            },
        }));
    }, []);

    const getStepData = useCallback(
        (stepId: string): StepData => {
            return state.stepsData[stepId] || {};
        },
        [state.stepsData],
    );

    const isStepCompleted = useCallback(
        (stepIndex: number): boolean => {
            return state.completedSteps.includes(stepIndex);
        },
        [state.completedSteps],
    );

    const isStepValid = useCallback(
        (stepIndex: number): boolean => {
            const step = steps[stepIndex];
            if (!step.validate) return true;
            const result = step.validate(state.stepsData[step.id] || {});
            if (result instanceof Promise) return false;
            return result;
        },
        [steps, state.stepsData],
    );

    const canNavigateToStep = useCallback(
        (stepIndex: number): boolean => {
            if (stepIndex === 0) return true;
            for (let i = 0; i < stepIndex; i++) {
                if (!state.completedSteps.includes(i)) return false;
            }
            return true;
        },
        [state.completedSteps],
    );

    const goToStep = useCallback(
        (stepIndex: number) => {
            if (!canNavigateToStep(stepIndex)) return;
            setState((prev) => ({ ...prev, currentStep: stepIndex }));
        },
        [canNavigateToStep],
    );

    const goNext = useCallback(async () => {
        const currentStepConfig = steps[state.currentStep];

        if (currentStepConfig.validate) {
            const isValid = await currentStepConfig.validate(getStepData(currentStepConfig.id));
            if (!isValid) {
                toast({
                    title: "Une erreur est survenue",
                    description: currentStepConfig.errorMessage,
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
                const lastStepId = steps[steps.length - 1].id;
                const style = getStepData(lastStepId).selectedLLM as "standard" | "precise" | "creative" | undefined;
                if (style) {
                    try {
                        await completeOnboarding({
                            workspaceId,
                            style,
                        }).unwrap();
                    } catch {
                        // ignore — navigate to dashboard regardless
                    }
                }
                await navigate(`/workspaces/${workspaceId}/dashboard`);
                return;
            }

            updateOnboardingStep({
                workspaceId,
                step: state.currentStep + 2,
            })
                .unwrap()
                .catch(() => {});
        }

        setState((prev) => {
            const completedSteps = [...prev.completedSteps];
            if (!completedSteps.includes(prev.currentStep)) {
                completedSteps.push(prev.currentStep);
            }
            return {
                ...prev,
                completedSteps,
                currentStep: Math.min(prev.currentStep + 1, steps.length - 1),
            };
        });
    }, [steps, workspaceId, getStepData, completeOnboarding, updateOnboardingStep, navigate, toast, state.currentStep]);

    const goPrevious = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentStep: Math.max(prev.currentStep - 1, 0),
        }));
    }, []);

    const resetOnboarding = useCallback(() => {
        setState({ currentStep: 0, completedSteps: [], stepsData: {} });
    }, []);

    const skip = useCallback(async () => {
        try {
            await skipOnboarding({ workspaceId }).unwrap();
            await navigate(`/workspaces/${workspaceId}/dashboard`);
        } catch {
            // navigate anyway — skip is best-effort
            await navigate(`/workspaces/${workspaceId}/dashboard`);
        }
    }, [workspaceId, skipOnboarding, navigate]);

    return {
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
        skip,
        workspaceId,
        agentId,
        sessionId,
        isSessionLoading,
        sessionError,
    };
};
