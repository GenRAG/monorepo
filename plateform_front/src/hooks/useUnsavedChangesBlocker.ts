import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import useThemedToast from "hooks/useThemedToast";

/** Blocks in-app navigation while there are unsaved workflow changes, with a toast to confirm leaving. */
export const useUnsavedChangesBlocker = (isDirty: boolean) => {
    const toast = useThemedToast();
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
    );
    const blockerRef = useRef(blocker);
    blockerRef.current = blocker;

    useEffect(() => {
        if (blocker.state !== "blocked") return;
        if (toast.isActive("workflow-unsaved")) return;
        toast({
            id: "workflow-unsaved",
            title: "Modifications non enregistrées",
            status: "warning",
            description: "Vous avez des modifications non enregistrées. Quitter la page ?",
            actionLabel: "Quitter sans enregistrer",
            onAction: () => {
                toast.close("workflow-unsaved");
                blockerRef.current.proceed?.();
            },
            onCloseComplete: () => {
                if (blockerRef.current.state === "blocked") blockerRef.current.reset?.();
            },
        });
    }, [blocker.state, toast]);
};
