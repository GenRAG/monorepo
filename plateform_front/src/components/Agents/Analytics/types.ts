export type Period = "7j" | "30j" | "90j";
export const PERIOD_DAYS: Record<Period, number> = { "7j": 7, "30j": 30, "90j": 90 };

export interface DailyMetrics {
    date: Date;
    label: string;
    queries: number;
    latencyP50: number;
    latencyP95: number;
    creditsPerQuery: number;
    successRate: number;
    errors: number;
    outOfCredits: number;
    /** USD cost for the day, broken down per model — mirrors the RAG engine's `by_model_and_type`. */
    costByModel: Record<string, number>;
}

/**
 * The RAG engine streams a `cost_summary` event per query with `total_cost_usd`, `by_model`,
 * `by_type` and `by_model_and_type` — but the backend only persists the flat `total_cost_usd`
 * (converted to `creditsUsed`) on `AgentQueryLog`. The breakdown is dropped before it reaches
 * the DB, so there's no real endpoint for it yet — this mirrors that shape as mock data.
 */
export type CostType = "generation" | "embedding" | "reranking";

export const COST_TYPE_LABEL: Record<CostType, string> = {
    generation: "Génération",
    embedding: "Embedding",
    reranking: "Reranking",
};

export interface CostModel {
    id: string;
    label: string;
    type: CostType;
}

export const COST_MODELS: CostModel[] = [
    { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", type: "generation" },
    { id: "qwen/qwen3-embedding-8b", label: "Qwen3 Embedding 8B", type: "embedding" },
    { id: "zerank-2", label: "ZeRank 2", type: "reranking" },
];

/** Mirrors `AgentQueryLog`: query, durationMs, status, creditsUsed, createdAt — nothing more is logged today. */
export type QueryStatus = "SUCCESS" | "ERROR" | "OUT_OF_CREDITS";

export interface RecentQuery {
    id: number;
    query: string;
    status: QueryStatus;
    durationMs: number;
    creditsUsed: number;
    createdAt: Date;
}

export const STATUS_LABEL: Record<QueryStatus, string> = {
    SUCCESS: "Succès",
    ERROR: "Erreur",
    OUT_OF_CREDITS: "Crédits épuisés",
};

export const STATUS_COLOR_SCHEME: Record<QueryStatus, string> = {
    SUCCESS: "green",
    ERROR: "red",
    OUT_OF_CREDITS: "orange",
};
