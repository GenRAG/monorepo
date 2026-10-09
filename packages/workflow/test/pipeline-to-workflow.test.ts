import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HorizontalLayoutStrategy } from "../src/layout";
import { TaskType } from "../src/types/task";
import type { PipelineBlock } from "../src/types/pipeline";
import { pipelineToWorkflow, UnsupportedPipelineBlockError } from "../src/utils/pipeline-to-workflow";
import { sanitizeWorkflowEdges } from "../src/utils/sanitize";
import { serializeWorkflow } from "../src/utils/serialize";
import { fullWorkflow } from "./fixtures";

const json = (v: unknown) => JSON.parse(JSON.stringify(v));

const FULL: PipelineBlock[] = [
    { name: "query", type: "query" },
    { name: "rewrite", type: "query_rewrite", model: "mistral" },
    { name: "retrieve", type: "retrieve", collection_name: "genrag_knowledge_base", top_k: 5, datasetIds: [] },
    { name: "rerank", type: "rerank", model: "colbert" },
    { name: "answer", type: "answer", model: "google/gemini-2.5-flash", system_prompt: "Réponds en français." },
];

const MINIMAL: PipelineBlock[] = [
    { name: "query", type: "query" },
    { name: "retrieve", type: "retrieve", collection_name: "genrag_knowledge_base", top_k: 5, datasetIds: [] },
    { name: "answer", type: "answer", model: "gpt-4o" },
];

describe("pipelineToWorkflow", () => {
    const WITH_DATASETS: PipelineBlock[] = [
        { name: "query", type: "query" },
        { name: "retrieve", type: "retrieve", collection_name: "genrag_knowledge_base", top_k: 5, datasetIds: ["d1", "d2"] },
        { name: "answer", type: "answer", model: "gpt-4o" },
    ];

    for (const [label, blocks] of [
        ["full pipeline", FULL],
        ["minimal pipeline without system prompt", MINIMAL],
        ["retriever restricted to datasets", WITH_DATASETS],
    ] as const) {
        it(`round-trips with serializeWorkflow (${label})`, () => {
            const { nodes, edges } = pipelineToWorkflow(blocks);

            assert.deepEqual(json(serializeWorkflow(nodes, edges).blocks), json(blocks));
        });
    }

    it("round-trips a workflow saved by the builder", () => {
        const saved = serializeWorkflow(fullWorkflow().nodes, fullWorkflow().edges).blocks;
        const rebuilt = pipelineToWorkflow(saved);

        assert.deepEqual(json(serializeWorkflow(rebuilt.nodes, rebuilt.edges).blocks), json(saved));
    });

    it("builds one chain node per block, linked in order, named after the blocks", () => {
        const { nodes, edges } = pipelineToWorkflow(FULL);
        const chain = nodes.filter((n) => !n.data.parentNodeId);

        assert.deepEqual(
            chain.map((n) => [n.id, n.data.type]),
            [
                ["query", TaskType.QUERY],
                ["rewrite", TaskType.REWRITER],
                ["retrieve", TaskType.RETRIEVER],
                ["rerank", TaskType.RERANKER],
                ["answer", TaskType.RESPONSE],
            ],
        );
        assert.deepEqual(
            edges.filter((e) => e.type === "default").map((e) => `${e.source}>${e.target}`),
            ["query>rewrite", "rewrite>retrieve", "retrieve>rerank", "rerank>answer"],
        );
    });

    it("fills the settings from the blocks and leaves a placeholder for a missing system prompt", () => {
        const { nodes } = pipelineToWorkflow(MINIMAL);
        const settings = nodes.filter((n) => n.data.parentNodeId === "answer");

        assert.deepEqual(
            settings.map((n) => [n.data.type, n.data.isPlaceholder, n.data.modelName]),
            [
                [TaskType.MODEL, false, "gpt-4o"],
                [TaskType.INSTRUCTION, true, undefined],
            ],
        );
    });

    it("places the chain with the given layout", () => {
        const vertical = pipelineToWorkflow(MINIMAL).nodes.filter((n) => !n.data.parentNodeId);
        const horizontal = pipelineToWorkflow(MINIMAL, { layout: new HorizontalLayoutStrategy() }).nodes.filter(
            (n) => !n.data.parentNodeId,
        );

        assert.deepEqual(vertical.map((n) => n.position), [
            { x: 100, y: 80 },
            { x: 100, y: 220 },
            { x: 100, y: 360 },
        ]);
        assert.deepEqual(horizontal.map((n) => n.position), [
            { x: 80, y: 200 },
            { x: 360, y: 200 },
            { x: 640, y: 200 },
        ]);
    });

    it("gives unique ids to blocks sharing a name", () => {
        const { nodes } = pipelineToWorkflow([
            { name: "step", type: "query" },
            { name: "step", type: "retrieve", collection_name: "c", top_k: 3 },
            { name: "", type: "answer", model: "gpt-4o" },
        ]);

        assert.deepEqual(nodes.filter((n) => !n.data.parentNodeId).map((n) => n.id), ["step", "step-2", "answer"]);
    });

    it("produces a graph that needs no repair", () => {
        const { nodes, edges } = pipelineToWorkflow(FULL);

        assert.deepEqual(sanitizeWorkflowEdges(nodes, edges), { nodes, edges });
    });

    it("rejects a block type the builder does not know", () => {
        const blocks = [{ name: "query", type: "query" }, { name: "x", type: "summarize" }] as unknown as PipelineBlock[];

        assert.throws(() => pipelineToWorkflow(blocks), UnsupportedPipelineBlockError);
        assert.throws(() => pipelineToWorkflow(blocks), /"summarize" at index 1/);
    });

    it("returns an empty graph for an empty pipeline", () => {
        assert.deepEqual(pipelineToWorkflow([]), { nodes: [], edges: [] });
    });
});
