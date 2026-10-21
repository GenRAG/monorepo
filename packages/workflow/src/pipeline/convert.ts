import type { Edge } from "@xyflow/react";
import type { AppNode } from "../types/app-node";
import type { PipelineBlock } from "../types/pipeline";
import { TaskType } from "../types/task";
import { blockFor } from "../utils/serialize";
import {
    chainToWorkflow,
    UnsupportedPipelineBlockError,
    type ChainEntry,
    type PipelineToWorkflowOptions,
} from "../utils/pipeline-to-workflow";
import type { Pipeline } from "./model";

/** The chain of a pipeline, in order: what both the engine blocks and the builder graph are drawn from. */
export function chainOf(pipeline: Pipeline): ChainEntry[] {
    const { rewrite, retrieve, rerank, answer } = pipeline;
    return [
        { name: "query", type: TaskType.QUERY, settings: {} },
        ...(rewrite ? [{ name: "rewrite", type: TaskType.REWRITER, settings: rewrite }] : []),
        { name: "retrieve", type: TaskType.RETRIEVER, settings: {}, datasetIds: retrieve.datasetIds },
        ...(rerank ? [{ name: "rerank", type: TaskType.RERANKER, settings: rerank }] : []),
        { name: "answer", type: TaskType.RESPONSE, settings: answer },
    ];
}

/** The blocks sent to the engine. A model not chosen yet falls back to the default, as `serializeWorkflow` does. */
export function toBlocks(pipeline: Pipeline): PipelineBlock[] {
    return chainOf(pipeline).map(
        ({ type, settings, datasetIds }) =>
            blockFor(type, {
                model: settings.model ?? undefined,
                instruction: settings.instruction ?? undefined,
                datasetIds: datasetIds && [...datasetIds],
            })!,
    );
}

/** The builder graph of a pipeline, drawn by the existing nodes. Node ids are the step names, stable across edits. */
export function pipelineToGraph(
    pipeline: Pipeline,
    options: PipelineToWorkflowOptions = {},
): { nodes: AppNode[]; edges: Edge[] } {
    return chainToWorkflow(chainOf(pipeline), options);
}

export class InvalidPipelineError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidPipelineError";
    }
}

const CHAIN: { type: PipelineBlock["type"]; required: boolean }[] = [
    { type: "query", required: true },
    { type: "query_rewrite", required: false },
    { type: "retrieve", required: true },
    { type: "rerank", required: false },
    { type: "answer", required: true },
];

/**
 * Parses stored blocks (`Workflow.definition.blocks`) into a pipeline. `collection_name` and `top_k` are not kept:
 * the builder does not expose them and `toBlocks` writes the defaults back.
 *
 * @throws UnsupportedPipelineBlockError on a block type the builder does not know.
 * @throws InvalidPipelineError when the blocks are not the chain query → [rewrite] → retrieve → [rerank] → answer.
 */
export function fromBlocks(blocks: readonly PipelineBlock[]): Pipeline {
    blocks.forEach((block, index) => {
        if (!CHAIN.some((step) => step.type === block?.type)) throw new UnsupportedPipelineBlockError(block?.type, index);
    });

    const byType: Partial<Record<PipelineBlock["type"], PipelineBlock>> = {};
    let index = 0;
    for (const step of CHAIN) {
        const block = blocks[index];
        if (block?.type === step.type) {
            byType[step.type] = block;
            index += 1;
        } else if (step.required) {
            throw new InvalidPipelineError(`Missing "${step.type}" block at index ${index}`);
        }
    }
    if (index < blocks.length) {
        throw new InvalidPipelineError(`Unexpected "${blocks[index].type}" block at index ${index}`);
    }

    const block = <T extends PipelineBlock["type"]>(type: T) => byType[type] as Extract<PipelineBlock, { type: T }> | undefined;
    const rewrite = block("query_rewrite");
    const rerank = block("rerank");
    const answer = block("answer")!;
    return {
        version: 1,
        rewrite: rewrite ? { model: rewrite.model || null } : null,
        retrieve: { datasetIds: [...new Set(block("retrieve")!.datasetIds ?? [])] },
        rerank: rerank ? { model: rerank.model || null } : null,
        answer: { model: answer.model || null, instruction: answer.system_prompt || null },
    };
}
