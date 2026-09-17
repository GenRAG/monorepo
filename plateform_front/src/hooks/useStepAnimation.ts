import { useEffect, useState } from "react";

interface UseStepAnimationOptions {
    stepCount: number;
    stepDurationMs?: number;
    tickMs?: number;
    /**
     * Some callers briefly reset `isInitialized` to false at the start of every step (not just the
     * first one) to suppress the progress bar's transition during the step-3→step-0 wrap-around
     * jump. Off by default to match most call sites' original behavior.
     */
    resetInitializedOnStepChange?: boolean;
}

export const useStepAnimation = ({
    stepCount,
    stepDurationMs = 3000,
    tickMs = 100,
    resetInitializedOnStepChange = false,
}: UseStepAnimationOptions) => {
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setProgress(0);
        if (resetInitializedOnStepChange) setIsInitialized(false);

        const initTimeout = setTimeout(() => {
            setIsInitialized(true);
        }, 10);

        const ticksPerStep = stepDurationMs / tickMs;
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 100 / ticksPerStep;
            });
        }, tickMs);

        const stepTimeout = setTimeout(() => {
            setStep((prev) => (prev + 1) % stepCount);
        }, stepDurationMs);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(stepTimeout);
            clearTimeout(initTimeout);
        };
    }, [step, stepCount, stepDurationMs, tickMs, resetInitializedOnStepChange]);

    return { step, progress, isInitialized };
};
