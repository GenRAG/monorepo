import { type HeatmapColumn } from "components/charts";
import { COST_MODELS, type CostType, type DailyMetrics, type RecentQuery } from "./types";

/** Mirrors the real `cost_summary` example (total_cost_usd ≈ 0.054, reranking-dominated). */
const AVG_COST_PER_QUERY_USD = 0.054;
const COST_SHARE_BY_TYPE: Record<CostType, number> = { generation: 0.243, embedding: 0.0008, reranking: 0.7562 };

/**
 * MOCK DATA ONLY — this page is a visual mockup. `AgentQueryLog` currently
 * stores query/durationMs/status/creditsUsed/createdAt with no aggregation
 * endpoint yet (no p50/p95, no per-stage cost breakdown). Wire this up to a
 * real per-agent stats endpoint once one exists.
 */
const FR_DAYS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const fmtShort = (d: Date) => `${FR_DAYS[d.getDay()]} ${d.getDate()}`;

export const daysAgo = (n: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
};

/** One shared 90-day base series — the period selector just slices the tail. */
const BASE_DAYS = 90;
export const baseMetrics: DailyMetrics[] = Array.from({ length: BASE_DAYS }, (_, i) => {
    const date = daysAgo(BASE_DAYS - 1 - i);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const trend = 1 + i / BASE_DAYS; // slow ramp-up over the quarter
    const base = (isWeekend ? 60 : 140) * trend;
    const queries = Math.max(5, Math.round(base + (Math.random() - 0.5) * 60));
    const latencyP50 = Math.max(90, Math.round(210 - i * 0.4 + (Math.random() - 0.5) * 60));
    const latencyP95 = Math.round(latencyP50 * (1.8 + Math.random() * 0.5));
    const creditsPerQuery = Math.max(0.4, +(1.6 + (Math.random() - 0.5) * 0.6).toFixed(2));
    const successRate = Math.min(100, Math.max(90, +(97.5 + (Math.random() - 0.5) * 4).toFixed(1)));
    const failures = Math.round((queries * (100 - successRate)) / 100);
    // Occasional credit-exhaustion incidents (workspace running low), rest are regular errors.
    const outOfCredits = Math.random() < 0.12 ? Math.round(failures * (0.4 + Math.random() * 0.4)) : 0;
    const errors = Math.max(0, failures - outOfCredits);
    const costPerQuery = AVG_COST_PER_QUERY_USD * (0.85 + Math.random() * 0.3);
    const dailyCostUsd = queries * costPerQuery;
    const costByModel: Record<string, number> = {};
    COST_MODELS.forEach((model) => {
        const share = COST_SHARE_BY_TYPE[model.type] * (0.9 + Math.random() * 0.2);
        costByModel[model.id] = +(dailyCostUsd * share).toFixed(6);
    });
    return {
        date,
        label: fmtShort(date),
        queries,
        latencyP50,
        latencyP95,
        creditsPerQuery,
        successRate,
        errors,
        outOfCredits,
        costByModel,
    };
});

export const toChartRows = <K extends keyof DailyMetrics>(rows: DailyMetrics[], key: K) =>
    rows.map((r) => ({ date: r.date, value: r[key] as number, label: r.label }));

export const DOCUMENT_HEALTH = [
    { name: "Indexés", value: 142 },
    { name: "En cours", value: 3 },
    { name: "Uploadés", value: 1 },
    { name: "Échoués", value: 5 },
];

const generateHeatmap = (): HeatmapColumn[] => {
    const totalDays = 365; // 52 weeks
    const start = daysAgo(totalDays - 1);
    const weeks: HeatmapColumn[] = [];
    for (let w = 0; w < totalDays / 7; w++) {
        const bins = Array.from({ length: 7 }, (_, d) => {
            const date = new Date(start);
            date.setDate(date.getDate() + w * 7 + d);
            const dow = date.getDay();
            const isWeekend = dow === 0 || dow === 6;
            const base = isWeekend ? 8 : 22;
            const count = Math.max(0, Math.round(base + (Math.random() - 0.5) * 20));
            return { bin: d, count, date };
        });
        weeks.push({ bin: w, bins });
    }
    return weeks;
};
export const heatmapData = generateHeatmap();

const hoursAgo = (h: number): Date => {
    const d = new Date();
    d.setHours(d.getHours() - h);
    return d;
};

export const fmtDateTime = (d: Date) => {
    const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const date = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    return `${time}, ${date}`;
};

export const mockRecentQueries: RecentQuery[] = [
    {
        id: 1,
        query: "Quelles sont les conclusions clés du rapport Q4 ?",
        status: "SUCCESS",
        durationMs: 2340,
        creditsUsed: 1,
        createdAt: hoursAgo(1),
    },
    {
        id: 2,
        query: "Comment calcule-t-on la valeur vie client ?",
        status: "SUCCESS",
        durationMs: 1780,
        creditsUsed: 1,
        createdAt: hoursAgo(3),
    },
    {
        id: 3,
        query: "Quel est le statut actuel de la roadmap produit ?",
        status: "SUCCESS",
        durationMs: 3120,
        creditsUsed: 2,
        createdAt: hoursAgo(5),
    },
    {
        id: 4,
        query: "Résume les indicateurs de performance de l'équipe support",
        status: "ERROR",
        durationMs: 8900,
        creditsUsed: 1,
        createdAt: hoursAgo(7),
    },
    {
        id: 5,
        query: "Quels documents parlent de la politique de remboursement ?",
        status: "SUCCESS",
        durationMs: 1560,
        creditsUsed: 1,
        createdAt: hoursAgo(9),
    },
    {
        id: 6,
        query: "Génère un résumé du contrat fournisseur signé en mars",
        status: "OUT_OF_CREDITS",
        durationMs: 210,
        creditsUsed: 0,
        createdAt: hoursAgo(11),
    },
    {
        id: 7,
        query: "Quelle est la procédure d'onboarding pour un nouveau client ?",
        status: "SUCCESS",
        durationMs: 1980,
        creditsUsed: 1,
        createdAt: hoursAgo(14),
    },
    {
        id: 8,
        query: "Génère un résumé du contrat fournisseur signé en mars",
        status: "OUT_OF_CREDITS",
        durationMs: 210,
        creditsUsed: 0,
        createdAt: hoursAgo(11),
    },
    {
        id: 9,
        query: "Quelle est la procédure d'onboarding pour un nouveau client ?",
        status: "SUCCESS",
        durationMs: 1980,
        creditsUsed: 1,
        createdAt: hoursAgo(14),
    },
    {
        id: 10,
        query: "Génère un résumé du contrat fournisseur signé en mars",
        status: "OUT_OF_CREDITS",
        durationMs: 210,
        creditsUsed: 0,
        createdAt: hoursAgo(11),
    },
    {
        id: 11,
        query: "Quelle est la procédure d'onboarding pour un nouveau client ?",
        status: "SUCCESS",
        durationMs: 1980,
        creditsUsed: 1,
        createdAt: hoursAgo(14),
    },
];
