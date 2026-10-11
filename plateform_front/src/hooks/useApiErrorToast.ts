import { useCallback } from "react";
import useThemedToast from "hooks/useThemedToast";
import { getApiErrorMessage } from "utils/apiError";

/** Toast d'erreur pour une requête API échouée : le message de l'API, sinon `fallback`. */
const useApiErrorToast = () => {
    const toast = useThemedToast();

    return useCallback(
        (title: string, error: unknown, fallback = "Veuillez réessayer.") =>
            toast({ title, description: getApiErrorMessage(error) || fallback, status: "error", duration: 5000 }),
        [toast],
    );
};

export default useApiErrorToast;
