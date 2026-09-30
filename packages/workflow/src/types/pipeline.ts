import type { Edge } from "@xyflow/react";
import type { AppNode } from "./app-node";

// Blocks sent to the RAG engine (`POST /rag/stream`): mirror of plateform_back/src/rag-engine/pipeline.schema.ts
// and rag-engine/BLOCKS_FORMAT.md. Any change here must be made there too.
export type QueryBlock = { name: string; type: "query" };
export type RewriteBlock = { name: string; type: "query_rewrite"; model: string };
export type RetrieveBlock = { name: string; type: "retrieve"; collection_name: string; top_k: number };
export type RerankBlock = { name: string; type: "rerank"; model: string };
export type AnswerBlock = { name: string; type: "answer"; model: string; system_prompt?: string };

export type PipelineBlock = QueryBlock | RewriteBlock | RetrieveBlock | RerankBlock | AnswerBlock;

/** What the builder saves (`Workflow.definition`): the graph for the UI and the blocks for the engine. */
export interface WorkflowDefinition {
    nodes: AppNode[];
    edges: Edge[];
    blocks: PipelineBlock[];
}
