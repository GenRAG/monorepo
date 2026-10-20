import { RagModel } from "types/models/models";
import { getProviderName } from "utils/models/modelFormatters";
import { getProviderSlug } from "utils/models/providerLogo";

export type SortMode = "default" | "recent" | "price-asc" | "price-desc";
export type PriceTier = "all" | "budget" | "standard" | "premium";
export type ContextTier = "all" | "128k" | "1m";

export interface ModelFilters {
    provider: string | null;
    price: PriceTier;
    context: ContextTier;
    reasoning: boolean;
}

export const NO_FILTERS: ModelFilters = { provider: null, price: "all", context: "all", reasoning: false };

export interface ProviderOption {
    slug: string;
    label: string;
    count: number;
}

// Bounds in $ per million input tokens, around the catalogue quartiles (0.13 / 0.40 / 1.5).
const BUDGET_MAX_PER_M = 0.15;
const PREMIUM_MIN_PER_M = 1.5;

const CONTEXT_MIN: Record<Exclude<ContextTier, "all">, number> = { "128k": 128_000, "1m": 1_000_000 };

export const getInputPrice = (m: RagModel) => parseFloat(m.pricing?.prompt ?? "0");

export const getPriceTier = (m: RagModel): Exclude<PriceTier, "all"> => {
    const perMillion = getInputPrice(m) * 1_000_000;
    if (perMillion < BUDGET_MAX_PER_M) return "budget";
    if (perMillion > PREMIUM_MIN_PER_M) return "premium";
    return "standard";
};

export const supportsReasoning = (m: RagModel) => m.supported_parameters?.includes("reasoning") ?? false;

export const providerOf = (m: RagModel) => getProviderSlug(m.id, m.provider) ?? "";

/** Providers present in the list, most models first. The label comes from model names ("OpenAI: GPT-4o"). */
export const getProviderOptions = (models: RagModel[]): ProviderOption[] => {
    const bySlug = new Map<string, ProviderOption>();
    for (const m of models) {
        const slug = providerOf(m);
        if (!slug) continue;
        const option = bySlug.get(slug);
        if (option) {
            option.count++;
            continue;
        }
        const prefix = m.name.includes(":") ? m.name.split(":")[0].trim() : "";
        bySlug.set(slug, { slug, label: prefix || getProviderName(slug), count: 1 });
    }
    return [...bySlug.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

export const countActiveFilters = (f: ModelFilters) =>
    [f.provider !== null, f.price !== "all", f.context !== "all", f.reasoning].filter(Boolean).length;

export const applyModelFilters = (
    models: RagModel[],
    search: string,
    filters: ModelFilters,
    sort: SortMode,
): RagModel[] => {
    const query = search.toLowerCase();
    const list = models.filter(
        (m) =>
            m.name?.toLowerCase().includes(query) &&
            (filters.provider === null || providerOf(m) === filters.provider) &&
            (filters.price === "all" || getPriceTier(m) === filters.price) &&
            (filters.context === "all" || (m.context_length ?? 0) >= CONTEXT_MIN[filters.context]) &&
            (!filters.reasoning || supportsReasoning(m)),
    );
    if (sort === "recent") return [...list].sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    if (sort === "price-asc") return [...list].sort((a, b) => getInputPrice(a) - getInputPrice(b));
    if (sort === "price-desc") return [...list].sort((a, b) => getInputPrice(b) - getInputPrice(a));
    return list;
};
