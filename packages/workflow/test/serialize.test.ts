import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { serializeWorkflow } from "../src/utils/serialize";
import { fullWorkflow, minimalWorkflow } from "./fixtures";

const json = (v: unknown) => JSON.parse(JSON.stringify(v));

describe("serializeWorkflow", () => {
    it("walks the main chain in order and reads MODEL / INSTRUCTION settings", () => {
        const { nodes, edges } = fullWorkflow();

        assert.deepEqual(json(serializeWorkflow(nodes, edges).blocks), [
            { name: "query", type: "query" },
            { name: "rewrite", type: "query_rewrite", model: "mistral" },
            { name: "retrieve", type: "retrieve", collection_name: "genrag_knowledge_base", top_k: 5 },
            { name: "rerank", type: "rerank", model: "colbert" },
            { name: "answer", type: "answer", model: "google/gemini-2.5-flash", system_prompt: "Réponds en français." },
        ]);
    });

    it("returns nodes and edges untouched next to the blocks", () => {
        const { nodes, edges } = fullWorkflow();
        const definition = serializeWorkflow(nodes, edges);

        assert.equal(definition.nodes, nodes);
        assert.equal(definition.edges, edges);
    });

    it("falls back to default models when a MODEL setting is still a placeholder (current contract, W-01)", () => {
        const { nodes, edges } = minimalWorkflow();

        assert.deepEqual(json(serializeWorkflow(nodes, edges).blocks), [
            { name: "query", type: "query" },
            { name: "retrieve", type: "retrieve", collection_name: "genrag_knowledge_base", top_k: 5 },
            { name: "answer", type: "answer", model: "gpt-4o" },
        ]);
    });

    it("ignores nodes that are not reachable from the QUERY node", () => {
        const { nodes, edges } = minimalWorkflow();
        const cut = edges.filter((e) => !(e.source === "r" && e.target === "s"));

        assert.deepEqual(
            serializeWorkflow(nodes, cut).blocks.map((b) => b.type),
            ["query", "retrieve"],
        );
    });

    it("returns no block without a QUERY node", () => {
        const { nodes, edges } = fullWorkflow();

        assert.deepEqual(serializeWorkflow(nodes.filter((n) => n.id !== "q"), edges).blocks, []);
    });
});
