import { z } from 'zod';

const QueryBlock = z.object({
    name: z.string(),
    type: z.literal('query'),
});

const RewriteBlock = z.object({
    name: z.string(),
    type: z.literal('query_rewrite'),
    model: z.string(),
});

const RetrieveBlock = z.object({
    name: z.string(),
    type: z.literal('retrieve'),
    top_k: z.number().int().positive().max(100),
    // The tenant is the request's `org_id` (one collection per workspace). `datasetIds` narrows the search to
    // the agent's datasets; it is left out only for a server-side org such as the onboarding demo base.
    datasetIds: z.array(z.string().min(1)).min(1).max(50).optional(),
});

const RerankBlock = z.object({
    name: z.string(),
    type: z.literal('rerank'),
    model: z.string(),
});

const AnswerBlock = z.object({
    name: z.string(),
    type: z.literal('answer'),
    model: z.string(),
    system_prompt: z.string().optional(),
});

export const PipelineBlockSchema = z.discriminatedUnion('type', [
    QueryBlock,
    RewriteBlock,
    RetrieveBlock,
    RerankBlock,
    AnswerBlock,
]);

export const PipelineSchema = z.array(PipelineBlockSchema);

export type PipelineBlock = z.infer<typeof PipelineBlockSchema>;
export type Pipeline = z.infer<typeof PipelineSchema>;
