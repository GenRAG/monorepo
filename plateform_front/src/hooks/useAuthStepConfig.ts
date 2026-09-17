import { useEffect } from "react";
import type { AuthStepType } from "pages/Auth/Layout/AuthLayout";
import { useAuthLayout } from "pages/Auth/Layout/AuthLayoutContext";

/**
 * Wires the shared auth layout's back button / background to the current step of a
 * multi-step auth flow (login, register, validate). `homeStep` and `backSteps` are enum
 * constants (stable across renders) and `setStep` is a `useState` setter, so they're
 * intentionally left out of the effect's deps, matching every call site's prior behavior.
 */
export const useAuthStepConfig = (
    step: AuthStepType,
    homeStep: AuthStepType,
    backSteps: AuthStepType[],
    setStep: (step: AuthStepType) => void,
) => {
    const { setConfig } = useAuthLayout();

    useEffect(() => {
        setConfig({
            canGoBack: backSteps.includes(step) ? () => setStep(homeStep) : undefined,
            showBackground: step === homeStep,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, setConfig]);
};
