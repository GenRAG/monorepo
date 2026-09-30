import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { linkNodes, makeFlowNode } from "../src/graph/create-flow-node";
import { HorizontalLayoutStrategy, VerticalLayoutStrategy } from "../src/layout";
import { TaskType } from "../src/types/task";

const nodes = [
    makeFlowNode("a", TaskType.QUERY, 100, 80),
    makeFlowNode("n", TaskType.REWRITER, 0, 0),
    makeFlowNode("b", TaskType.RETRIEVER, 300, 480),
];

describe("VerticalLayoutStrategy", () => {
    const layout = new VerticalLayoutStrategy();

    it("places a node between its parent and its successor", () => {
        assert.deepEqual(layout.computePlacements(nodes, [linkNodes("a", "n"), linkNodes("n", "b")], "n"), [
            { id: "n", position: { x: 200, y: 280 } },
        ]);
    });

    it("places a node below its parent, or above its successor", () => {
        assert.deepEqual(layout.computePlacements(nodes, [linkNodes("a", "n")], "n")[0].position, { x: 100, y: 220 });
        assert.deepEqual(layout.computePlacements(nodes, [linkNodes("n", "b")], "n")[0].position, { x: 300, y: 340 });
        assert.deepEqual(layout.computePlacements(nodes, [], "n")[0].position, { x: 100, y: 80 });
    });

    it("spreads settings to the right of their parent", () => {
        assert.equal(layout.isVertical, true);
        assert.deepEqual([0, 1].map((i) => layout.getSettingOffset(i, 2)), [
            { x: 280, y: -65 },
            { x: 280, y: 65 },
        ]);
    });
});

describe("HorizontalLayoutStrategy", () => {
    const layout = new HorizontalLayoutStrategy();

    it("places a node right of its parent, or left of its successor", () => {
        assert.deepEqual(layout.computePlacements(nodes, [linkNodes("a", "n")], "n")[0].position, { x: 380, y: 80 });
        assert.deepEqual(layout.computePlacements(nodes, [linkNodes("n", "b")], "n")[0].position, { x: 20, y: 480 });
        assert.deepEqual(layout.computePlacements(nodes, [], "n")[0].position, { x: 80, y: 200 });
    });

    it("stacks settings in a column below their parent", () => {
        // Was a row (x: -180 / 0 / 180): it overlapped the settings of the next node (seen with WorkflowViewer).
        // Only used by WorkflowViewer / pipelineToWorkflow and by node insertion, which previews do not allow.
        assert.equal(layout.isVertical, false);
        assert.deepEqual([0, 1, 2].map((i) => layout.getSettingOffset(i, 3)), [
            { x: 0, y: 150 },
            { x: 0, y: 270 },
            { x: 0, y: 390 },
        ]);
    });
});
