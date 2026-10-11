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
    collection_name: z.string(),
    top_k: z.number().int().positive(),
    // Vector-store tenant filter, always computed by the backend from validated datasets. Never empty: an
    // unfiltered retrieve would search every customer's documents in the shared collection.
    org_ids: z.array(z.string().min(1)).min(1),
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
