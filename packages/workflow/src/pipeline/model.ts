/**
 * A RAG pipeline as the builder edits it: the fixed chain QUERY → [rewrite] → retrieve → [rerank] → answer, with the
 * settings of each step. Every step appears at most once and in this order by construction, so no state of this type
 * is an invalid chain. `null`: optional step absent, or setting not chosen yet.
 */
export interface Pipeline {
    version: 1;
    rewrite: { model: string | null } | null;
    /** No dataset: every dataset of the agent. */
    retrieve: { datasetIds: readonly string[] };
    rerank: { model: string | null } | null;
    answer: { model: string | null; instruction: string | null };
}

/** The steps the user may add or remove. */
export type OptionalStep = "rewrite" | "rerank";
/** The steps that run a model. */
export type ModelStep = "rewrite" | "rerank" | "answer";

/** A new agent's pipeline: the required steps, nothing chosen. */
export const emptyPipeline = (): Pipeline => ({
    version: 1,
    rewrite: null,
    retrieve: { datasetIds: [] },
    rerank: null,
    answer: { model: null, instruction: null },
});

/** A required setting left empty, in chain order. */
export type MissingSetting = { step: ModelStep; setting: "model" | "instruction" };

export function missingSettings(pipeline: Pipeline): MissingSetting[] {
    const missing: MissingSetting[] = [];
    if (pipeline.rewrite && !pipeline.rewrite.model) missing.push({ step: "rewrite", setting: "model" });
    if (pipeline.rerank && !pipeline.rerank.model) missing.push({ step: "rerank", setting: "model" });
    if (!pipeline.answer.model) missing.push({ step: "answer", setting: "model" });
    if (!pipeline.answer.instruction) missing.push({ step: "answer", setting: "instruction" });
    return missing;
}
