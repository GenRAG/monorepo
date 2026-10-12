import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    createMultipleSettingNode,
    EMPTY_SETTING_NODE_TYPE,
    insertChainNode,
    linkNodes,
    makeFlowNode,
    withAutoSettings,
    withEmptySettingNodes,
} from "../src/graph/create-flow-node";
import { getAddableTaskTypes, getConfigInputs, getNonSettingsTaskTypes, isSettingsTaskType } from "../src/graph/task-utils";
import { SETTING_KINDS } from "../src/graph/setting-kinds";
import { DEFAULT_LAYOUT } from "../src/layout";
import type { AppNodeData } from "../src/types/app-node";
import { TaskParamType, TaskType } from "../src/types/task";
import { fullWorkflow, minimalWorkflow, settingNodesOf } from "./fixtures";

describe("task utils", () => {
    it("lists the setting inputs of a task", () => {
        assert.deepEqual(
            getConfigInputs(TaskType.RESPONSE).map((i) => [i.name, i.nodeType, i.type]),
            [
                ["Modèle IA", TaskType.MODEL, TaskParamType.SELECT],
                ["Instruction", TaskType.INSTRUCTION, TaskParamType.STRING],
            ],
        );
        assert.deepEqual(getConfigInputs(TaskType.QUERY), []);
    });

    it("offers only the optional chain nodes that are not present yet", () => {
        assert.deepEqual(
            getAddableTaskTypes([TaskType.QUERY, TaskType.RETRIEVER, TaskType.RESPONSE]).sort(),
            [TaskType.RERANKER, TaskType.REWRITER],
        );
        assert.deepEqual(
            getAddableTaskTypes([TaskType.QUERY, TaskType.REWRITER, TaskType.RETRIEVER, TaskType.RESPONSE]),
            [TaskType.RERANKER],
        );
    });

    it("lists the chain task types", () => {
        assert.deepEqual(getNonSettingsTaskTypes().sort(), [
            TaskType.QUERY,
            TaskType.RERANKER,
            TaskType.RESPONSE,
            TaskType.RETRIEVER,
            TaskType.REWRITER,
        ]);
    });
});

describe("withAutoSettings", () => {
    const chain = () => ({
        nodes: [makeFlowNode("r", TaskType.RETRIEVER, 0, 0), makeFlowNode("s", TaskType.RESPONSE, 100, 200)],
        edges: [linkNodes("r", "s")],
    });

    it("creates no placeholder for a multiple input (DATASET of the retriever)", () => {
        const { nodes } = withAutoSettings(chain().nodes, chain().edges);

        assert.equal(settingNodesOf(nodes, "r").length, 0);
    });

    it("adds one placeholder per setting input, next to its parent", () => {
        const { nodes, edges } = withAutoSettings(chain().nodes, chain().edges);
        const settings = settingNodesOf(nodes, "s");

        assert.equal(settings.length, 2);
        assert.ok(settings.every((n) => n.data.isPlaceholder === true));
        assert.deepEqual(
            settings.map((n) => n.position),
            [
                { x: 380, y: 135 },
                { x: 380, y: 265 },
            ],
        );
        assert.deepEqual(
            edges.filter((e) => e.type === "settings").map((e) => [e.id, e.sourceHandle, e.targetHandle]),
            [
                ["s-setting-Modèle IA", "setting-source-Modèle IA", "setting-target"],
                ["s-setting-Instruction", "setting-source-Instruction", "setting-target"],
            ],
        );
    });

    it("fills the given values instead of placeholders", () => {
        const { nodes } = withAutoSettings(chain().nodes, chain().edges, {
            s: { "Modèle IA": "mistral", Instruction: "Sois bref." },
        });
        const [model, instruction] = settingNodesOf(nodes, "s");

        assert.equal(model.data.isPlaceholder, false);
        assert.equal(model.data.modelName, "mistral");
        assert.equal(instruction.data.stringValue, "Sois bref.");
    });

    it("does not duplicate a setting that is already connected", () => {
        const first = withAutoSettings(chain().nodes, chain().edges);
        const second = withAutoSettings(first.nodes, first.edges);

        assert.equal(second.nodes.length, first.nodes.length);
        assert.equal(second.edges.length, first.edges.length);
    });
});

describe("insertChainNode", () => {
    const mainEdges = (edges: { source: string; target: string; type?: string }[]) =>
        edges.filter((e) => e.type !== "settings").map((e) => [e.source, e.target]);

    it("inserts the node between its parent and the next node, with its setting placeholders", () => {
        const { nodes, edges } = insertChainNode(minimalWorkflow().nodes, minimalWorkflow().edges, TaskType.RERANKER)!;
        const reranker = nodes.find((n) => n.data.type === TaskType.RERANKER)!;

        assert.deepEqual(mainEdges(edges), [
            ["q", "r"],
            ["r", reranker.id],
            [reranker.id, "s"],
        ]);
        assert.equal(reranker.deletable, true);
        const settings = settingNodesOf(nodes, reranker.id);
        assert.equal(settings.length, 1);
        assert.equal(settings[0].data.isPlaceholder, true);
    });

    it("places the node between its neighbours, its settings following it", () => {
        const { nodes } = insertChainNode(minimalWorkflow().nodes, minimalWorkflow().edges, TaskType.REWRITER)!;
        const rewriter = nodes.find((n) => n.data.type === TaskType.REWRITER)!;
        const [setting] = settingNodesOf(nodes, rewriter.id);
        const offset = DEFAULT_LAYOUT.getSettingOffset(0, 1);

        assert.deepEqual(rewriter.position, { x: 0, y: 70 });
        assert.deepEqual(setting.position, { x: rewriter.position.x + offset.x, y: rewriter.position.y + offset.y });
    });

    it("does nothing when the node is already present or nothing can chain it", () => {
        const { nodes, edges } = fullWorkflow();

        assert.equal(insertChainNode(nodes, edges, TaskType.REWRITER), null);
        assert.equal(insertChainNode(nodes, edges, TaskType.RESPONSE), null);
    });
});

describe("withEmptySettingNodes", () => {
    it("shows an 'all bases' node on a retriever without dataset, linked to its dataset handle", () => {
        const { nodes, edges } = minimalWorkflow();
        const canvas = withEmptySettingNodes(nodes, edges);
        const [empty] = canvas.nodes.filter((n) => n.type === EMPTY_SETTING_NODE_TYPE);

        assert.equal(canvas.nodes.length, nodes.length + 1);
        assert.equal(empty.data.type, TaskType.DATASET);
        assert.equal(empty.data.parentNodeId, "r");
        assert.equal(empty.selectable, false);
        const edge = canvas.edges.find((e) => e.target === empty.id)!;
        assert.deepEqual([edge.source, edge.sourceHandle, edge.type], ["r", "setting-source-Bases", "settings"]);
    });

    it("shows nothing once a dataset is chosen, and never touches the saved graph", () => {
        const { nodes, edges } = minimalWorkflow();
        const retriever = nodes.find((n) => n.id === "r")!;
        const input = getConfigInputs(TaskType.RETRIEVER).find((i) => i.multiple)!;
        const dataset = createMultipleSettingNode(retriever, input, "ds-1", 0);
        const withDataset = { nodes: [...nodes, dataset.node], edges: [...edges, dataset.edge] };

        const canvas = withEmptySettingNodes(withDataset.nodes, withDataset.edges);

        assert.equal(canvas.nodes, withDataset.nodes);
        assert.equal(canvas.edges, withDataset.edges);
        assert.equal(nodes.length, minimalWorkflow().nodes.length);
    });
});

describe("setting kinds", () => {
    it("reads back what it writes, for each setting type", () => {
        for (const type of [TaskType.MODEL, TaskType.INSTRUCTION, TaskType.DATASET]) {
            const kind = SETTING_KINDS[type]!;
            const data = { type, inputs: {}, outputs: [] } as AppNodeData;
            assert.equal(kind.read({ ...data, ...kind.write(data, "value") }), "value");
        }
    });

    it("recognizes setting task types from the table", () => {
        assert.equal(isSettingsTaskType(TaskType.DATASET), true);
        assert.equal(isSettingsTaskType(TaskType.RETRIEVER), false);
    });
});
