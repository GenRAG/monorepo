import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeWorkflowEdges } from "../src/utils/sanitize";
import { fullWorkflow, settingNodesOf } from "./fixtures";

describe("sanitizeWorkflowEdges", () => {
    it("keeps a valid workflow as is", () => {
        const { nodes, edges } = fullWorkflow();
        const result = sanitizeWorkflowEdges(nodes, edges);

        assert.deepEqual(result.edges, edges);
        assert.deepEqual(result.nodes, nodes);
    });

    it("remaps a settings edge whose input was renamed, using the setting node type", () => {
        const { nodes, edges } = fullWorkflow();
        const stale = edges.map((e) =>
            e.sourceHandle === "setting-source-Modèle de tri" ? { ...e, sourceHandle: "setting-source-Old name" } : e,
        );

        const result = sanitizeWorkflowEdges(nodes, stale);
        const remapped = result.edges.find((e) => e.source === "k" && e.type === "settings")!;
        const settingNode = result.nodes.find((n) => n.id === remapped.target)!;

        assert.equal(remapped.sourceHandle, "setting-source-Modèle de tri");
        assert.equal(remapped.id, "k-setting-Modèle de tri");
        assert.equal(settingNode.data.settingLabel, "Modèle de tri");
    });

    it("drops setting nodes whose parent no longer exists", () => {
        const { nodes, edges } = fullWorkflow();
        const orphanIds = settingNodesOf(nodes, "k").map((n) => n.id);

        const result = sanitizeWorkflowEdges(nodes.filter((n) => n.id !== "k"), edges);

        assert.ok(orphanIds.length > 0);
        assert.ok(result.nodes.every((n) => !orphanIds.includes(n.id)));
        assert.ok(result.edges.every((e) => e.source !== "k" || e.type !== "settings"));
    });
});
