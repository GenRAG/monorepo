import { type QueryLogStatus } from "services/analytics/analytics";

export type Period = "7j" | "30j" | "90j";
export const PERIOD_DAYS: Record<Period, number> = { "7j": 7, "30j": 30, "90j": 90 };

export const STATUS_LABEL: Record<QueryLogStatus, string> = {
    SUCCESS: "Succès",
    ERROR: "Erreur",
    OUT_OF_CREDITS: "Crédits épuisés",
};

export const STATUS_COLOR_SCHEME: Record<QueryLogStatus, string> = {
    SUCCESS: "green",
    ERROR: "red",
    OUT_OF_CREDITS: "orange",
};
