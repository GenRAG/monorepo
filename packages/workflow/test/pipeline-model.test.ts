import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Edge } from "@xyflow/react";
import type { AppNode } from "../src/types/app-node";
import type { PipelineBlock } from "../src/types/pipeline";
import { TaskType } from "../src/types/task";
import { applyCommand, emptyPipeline, missingSettings, type Pipeline, type PipelineCommand } from "../src/pipeline";
import { fromBlocks, InvalidPipelineError, pipelineToGraph, toBlocks } from "../src/pipeline";
import { pipelineToWorkflow, UnsupportedPipelineBlockError } from "../src/utils/pipeline-to-workflow";
import { sanitizeWorkflowEdges } from "../src/utils/sanitize";
import { serializeWorkflow } from "../src/utils/serialize";

const json = (v: unknown) => JSON.parse(JSON.stringify(v));
const run = (commands: PipelineCommand[], from: Pipeline = emptyPipeline()) => commands.reduce(applyCommand, from);

const FULL: PipelineBlock[] = [
    { name: "query", type: "query" },
    { name: "rewrite", type: "query_rewrite", model: "mistral" },
    { name: "retrieve", type: "retrieve", collection_name: "genrag_knowledge_base", top_k: 5, datasetIds: ["d1", "d2"] },
    { name: "rerank", type: "rerank", model: "colbert" },
    { name: "answer", type: "answer", model: "google/gemini-2.5-flash", system_prompt: "Réponds en français." },
];
const MINIMAL: PipelineBlock[] = [
    { name: "query", type: "query" },
    { name: "retrieve", type: "retrieve", collection_name: "genrag_knowledge_base", top_k: 5, datasetIds: [] },
    { name: "answer", type: "answer", model: "gpt-4o" },
];

/** A graph without its random setting-node ids: what a user sees, and what the engine gets. */
function shape({ nodes, edges }: { nodes: AppNode[]; edges: Edge[] }) {
    const parentOf = (n: AppNode) => n.data.parentNodeId ?? "";
    return {
        nodes: nodes
            .map((n) => ({
                at: n.data.parentNodeId ? `${parentOf(n)}/${n.data.settingLabel}` : n.id,
                type: n.data.type,
                position: n.position,
                placeholder: n.data.isPlaceholder ?? false,
                value: n.data.modelName ?? n.data.stringValue ?? n.data.inputs.datasetId,
            }))
            .sort((a, b) => `${a.at}${a.value}`.localeCompare(`${b.at}${b.value}`)),
        edges: edges.filter((e) => e.type !== "settings").map((e) => e.id),
        settingEdges: edges.filter((e) => e.type === "settings").length,
    };
}

describe("Pipeline commands", () => {
    it("adds and removes optional steps, once", () => {
        const withRewrite = run([{ type: "addStep", step: "rewrite" }]);
        assert.deepEqual(withRewrite.rewrite, { model: null });
        assert.equal(applyCommand(withRewrite, { type: "addStep", step: "rewrite" }), withRewrite);

        const removed = applyCommand(withRewrite, { type: "removeStep", step: "rewrite" });
        assert.equal(removed.rewrite, null);
        assert.equal(applyCommand(removed, { type: "removeStep", step: "rewrite" }), removed);
    });

    it("sets a model only on a step that is there", () => {
        const pipeline = emptyPipeline();
        assert.equal(applyCommand(pipeline, { type: "setModel", step: "rerank", model: "bge" }), pipeline);
        assert.deepEqual(
            run([
                { type: "addStep", step: "rerank" },
                { type: "setModel", step: "rerank", model: "bge" },
            ]).rerank,
            { model: "bge" },
        );
    });

    it("keeps each dataset once and removes it", () => {
        const pipeline = run([
            { type: "addDataset", datasetId: "d1" },
            { type: "addDataset", datasetId: "d2" },
            { type: "addDataset", datasetId: "d1" },
            { type: "removeDataset", datasetId: "d2" },
        ]);
        assert.deepEqual(pipeline.retrieve.datasetIds, ["d1"]);
    });

    it("lists the required settings left empty, in chain order", () => {
        assert.deepEqual(missingSettings(run([{ type: "addStep", step: "rewrite" }])), [
            { step: "rewrite", setting: "model" },
            { step: "answer", setting: "model" },
            { step: "answer", setting: "instruction" },
        ]);
        assert.deepEqual(
            missingSettings(
                run([
                    { type: "setModel", step: "answer", model: "gpt-4o" },
                    { type: "setInstruction", instruction: "Sois bref." },
                ]),
            ),
            [],
        );
    });
});

describe("Pipeline blocks", () => {
    for (const [label, blocks] of [
        ["full", FULL],
        ["minimal", MINIMAL],
    ] as const) {
        it(`round-trips the stored blocks (${label})`, () => {
            assert.deepEqual(json(toBlocks(fromBlocks(blocks))), json(blocks));
        });
    }

    it("rejects a block type the builder does not know", () => {
        const blocks = [...MINIMAL, { name: "x", type: "summarize" }] as unknown as PipelineBlock[];
        assert.throws(() => fromBlocks(blocks), UnsupportedPipelineBlockError);
    });

    it("rejects blocks that are not the RAG chain", () => {
        const [query, retrieve, answer] = MINIMAL;
        const rerank: PipelineBlock = { name: "rerank", type: "rerank", model: "bge" };
        for (const [blocks, message] of [
            [[query, retrieve], /Missing "answer" block at index 2/],
            [[query, rerank, retrieve, answer], /Missing "retrieve" block at index 1/],
            [[query, retrieve, retrieve, answer], /Missing "answer" block at index 2/],
            [[query, retrieve, answer, answer], /Unexpected "answer" block at index 3/],
        ] as const) {
            assert.throws(() => fromBlocks(blocks), InvalidPipelineError);
            assert.throws(() => fromBlocks(blocks), message);
        }
    });
});

describe("Pipeline, against the current graph model", () => {
    const pipelines: [string, Pipeline][] = [
        ["full", fromBlocks(FULL)],
        ["minimal", fromBlocks(MINIMAL)],
        ["new agent, nothing chosen", emptyPipeline()],
        ["optional steps added, models not chosen", run([{ type: "addStep", step: "rewrite" }, { type: "addStep", step: "rerank" }])],
    ];

    for (const [label, pipeline] of pipelines) {
        it(`sends the engine the blocks serializeWorkflow sends for its graph (${label})`, () => {
            const graph = pipelineToGraph(pipeline);
            assert.deepEqual(json(toBlocks(pipeline)), json(serializeWorkflow(graph.nodes, graph.edges).blocks));
        });

        it(`draws a graph that needs no repair (${label})`, () => {
            const graph = pipelineToGraph(pipeline);
            assert.deepEqual(sanitizeWorkflowEdges(graph.nodes, graph.edges), graph);
        });
    }

    for (const [label, blocks] of [
        ["full", FULL],
        ["minimal", MINIMAL],
    ] as const) {
        it(`draws the graph pipelineToWorkflow draws from the same blocks (${label})`, () => {
            assert.deepEqual(shape(pipelineToGraph(fromBlocks(blocks))), shape(pipelineToWorkflow(blocks)));
        });
    }

    it("draws placeholders for the settings not chosen yet", () => {
        const { nodes } = pipelineToGraph(emptyPipeline());
        const settings = nodes.filter((n) => n.data.parentNodeId === "answer");
        assert.deepEqual(
            settings.map((n) => [n.data.type, n.data.isPlaceholder]),
            [
                [TaskType.MODEL, true],
                [TaskType.INSTRUCTION, true],
            ],
        );
    });
});
