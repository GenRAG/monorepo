import { COST_MODELS, type CostType, type DailyMetrics } from "./types";

export const sumCost = (rows: DailyMetrics[]): number =>
    rows.reduce((sum, row) => sum + Object.values(row.costByModel).reduce((s, v) => s + v, 0), 0);

export const costByModelTotals = (rows: DailyMetrics[]): Record<string, number> => {
    const totals: Record<string, number> = {};
    rows.forEach((row) => {
        Object.entries(row.costByModel).forEach(([modelId, cost]) => {
            totals[modelId] = (totals[modelId] ?? 0) + cost;
        });
    });
    return totals;
};

export const costByTypeTotals = (rows: DailyMetrics[]): Record<CostType, number> => {
    const modelTotals = costByModelTotals(rows);
    const totals: Record<CostType, number> = { generation: 0, embedding: 0, reranking: 0 };
    COST_MODELS.forEach((model) => {
        totals[model.type] += modelTotals[model.id] ?? 0;
    });
    return totals;
};

/** Mirrors `plateform_back/src/credit/credit-pricing.ts` (`costToCredits`) — USD → credits, with margin. */
const CREDITS_PER_UNIT = 500;
const MARGIN_MULTIPLIER = 1.5;

export const usdToCredits = (costUsd: number): number => Math.ceil(costUsd * MARGIN_MULTIPLIER * CREDITS_PER_UNIT);

export const fmtCredits = (value: number): string => {
    const rounded = Math.round(value);
    return `${rounded.toLocaleString("fr-FR")} crédit${rounded !== 1 ? "s" : ""}`;
};
