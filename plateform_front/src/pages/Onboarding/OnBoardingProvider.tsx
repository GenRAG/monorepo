import useThemedToast from 'hooks/useThemedToast';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

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
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'onboarding_state';

export const OnboardingProvider: React.FC<{
  children: ReactNode;
  steps: StepConfig[];
}> = ({ children, steps }) => {
  const toast = useThemedToast();
  const [state, setState] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    return {
      currentStep: 0,
      completedSteps: [],
      stepsData: {},
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateStepData = (stepId: string, data: Partial<StepData>) => {
    setState((prev) => ({
      ...prev,
      stepsData: {
        ...prev.stepsData,
        [stepId]: {
          ...prev.stepsData[stepId],
          ...data,
        },
      },
    }));
  };

  const getStepData = (stepId: string): StepData => {
    return state.stepsData[stepId] || {};
  };

  const isStepValid = (stepIndex: number): boolean => {
    const step = steps[stepIndex];
    if (!step.validate) return true;

    const stepData = getStepData(step.id);
    const result = step.validate(stepData);

    if (result instanceof Promise) {
      return false;
    }
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
    if (!canNavigateToStep(stepIndex)) {
      console.warn(`Cannot navigate to step ${stepIndex}. Previous steps not completed.`);
      return;
    }
    setState((prev) => ({ ...prev, currentStep: stepIndex }));
  };

  const goNext = async () => {
    const currentStepConfig = steps[state.currentStep];

    if (currentStepConfig.validate) {
      const stepData = getStepData(currentStepConfig.id);
      const isValid = await currentStepConfig.validate(stepData);

      if (!isValid) {
        toast({
          title: "An error occurred.",
          description: 'Please complete the required fields before proceeding.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
        return;
      }
    }

    setState((prev) => {
      const completedSteps = [...prev.completedSteps];
      if (!completedSteps.includes(prev.currentStep)) {
        completedSteps.push(prev.currentStep);
      }

      if (currentStepConfig.onComplete) {
        currentStepConfig.onComplete(prev.stepsData[currentStepConfig.id] || {});
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
    setState({
      currentStep: 0,
      completedSteps: [],
      stepsData: {},
    });
    localStorage.removeItem(STORAGE_KEY);
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
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
