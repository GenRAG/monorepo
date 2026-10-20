import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flowEdgeTiming, flowNodeBeats, mainChainEdgeIds, mainChainNodeIds } from "../src/graph/flow-timeline";
import { fullWorkflow, minimalWorkflow } from "./fixtures";

const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe("flow timeline", () => {
    it("orders the main chain from the question, ignoring settings edges", () => {
        const full = fullWorkflow();
        assert.deepEqual(mainChainEdgeIds(full.nodes, full.edges), ["q-to-w", "w-to-r", "r-to-k", "k-to-s"]);

        const minimal = minimalWorkflow();
        assert.deepEqual(mainChainEdgeIds(minimal.nodes, minimal.edges), ["q-to-r", "r-to-s"]);
        assert.deepEqual(mainChainNodeIds(minimal.nodes, minimal.edges), ["q", "r", "s"]);
        assert.deepEqual(mainChainNodeIds(minimal.nodes, []), [], "no chain without an edge out of QUERY");
    });

    it("stops on a cycle instead of looping forever", () => {
        const { nodes, edges } = fullWorkflow();
        const looped = [...edges, { id: "s-to-q", source: "s", target: "q", type: "default" }];
        assert.equal(mainChainEdgeIds(nodes, looped).length, 5);
    });

    it("hands the token from one edge to the next, inside one shared cycle", () => {
        const count = 4;
        const timings = Array.from({ length: count }, (_, i) => flowEdgeTiming(i, count));

        assert.ok(timings.every((t) => t.duration === timings[0].duration));
        assert.ok(timings[0].sourceGlow && close(timings[0].sourceGlow[1], timings[0].travel[0]));
        assert.ok(timings.slice(1).every((t) => t.sourceGlow === undefined));
        for (let i = 0; i < count - 1; i++) {
            assert.ok(close(timings[i].travel[1], timings[i].targetGlow[0]), "the target lights up when the token arrives");
            assert.ok(close(timings[i].targetGlow[1], timings[i + 1].travel[0]), "the next token leaves when the glow ends");
        }
        assert.ok(timings[count - 1].targetGlow[1] < 1, "a pause before the cycle restarts");
    });

    it("types the question before the first token leaves, and the answer once the last one arrives", () => {
        const count = 3;
        const timings = Array.from({ length: count }, (_, i) => flowEdgeTiming(i, count));
        const first = timings[0];
        const last = timings[count - 1];

        assert.ok(first.question && first.question.typing[1] <= first.travel[0], "the question is written before it travels");
        assert.ok(last.answer && last.answer.typing[0] >= last.travel[1], "the answer is written after the last token arrives");
        assert.ok(close(first.question.visible[1], last.answer.visible[1]), "both bubbles leave together");
        assert.ok(last.answer.visible[1] < 1, "both bubbles leave before the cycle restarts");
        assert.ok(timings.slice(1).every((t) => !t.question));
        assert.ok(timings.slice(0, -1).every((t) => !t.answer));
    });

    it("puts the question and the answer on the same edge when the chain has one edge", () => {
        const only = flowEdgeTiming(0, 1);
        assert.ok(only.question && only.answer);
    });

    it("lets each node read its settings while it holds the data", () => {
        const count = 3;
        const edges = Array.from({ length: count }, (_, i) => flowEdgeTiming(i, count));
        const nodes = Array.from({ length: count + 1 }, (_, p) => flowNodeBeats(p, count));

        for (const [p, { duration, settings }] of nodes.entries()) {
            assert.ok(close(duration, edges[0].duration), "one shared cycle");
            assert.ok(settings[0] < settings[1], "a real window");
            if (p > 0) assert.ok(settings[0] > edges[p - 1].travel[1], "after the data arrives");
            if (p < count) assert.ok(settings[1] < edges[p].travel[0], "before the data leaves");
        }
        assert.ok(nodes[count].settings[1] < edges[count - 1].answer!.typing[0], "the answer is written once settings are read");
    });
});
