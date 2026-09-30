import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { makeFlowNode, withAutoSettings } from "../src/graph/create-flow-node";
import { TASK_SPECS } from "../src/graph/task-specs";
import { getAddableTaskTypes, getConfigInputs, getTaskSpec } from "../src/graph/task-utils";
import { LinearLayoutStrategy } from "../src/layout";
import { HandleId, settingInputName, settingSourceHandle } from "../src/types/edge";
import { TaskType, type TaskSpecRegistry } from "../src/types/task";

// A consumer (e.g. an admin dashboard) can ship its own labels, settings or chaining rules.
const englishSpecs: TaskSpecRegistry = {
    ...TASK_SPECS,
    [TaskType.RESPONSE]: {
        ...TASK_SPECS[TaskType.RESPONSE],
        label: "Answer",
        inputs: [{ ...TASK_SPECS[TaskType.RESPONSE].inputs[0], name: "Model" }],
    },
    [TaskType.RETRIEVER]: { ...TASK_SPECS[TaskType.RETRIEVER], chainOutputs: [] },
};

describe("custom task registry", () => {
    it("is read by the task helpers instead of the default specs", () => {
        assert.equal(getTaskSpec(TaskType.RESPONSE, englishSpecs)?.label, "Answer");
        assert.deepEqual(getConfigInputs(TaskType.RESPONSE, englishSpecs).map((i) => i.name), ["Model"]);
        assert.deepEqual(getAddableTaskTypes([TaskType.QUERY, TaskType.RETRIEVER], englishSpecs), [TaskType.REWRITER]);
    });

    it("drives the settings created by withAutoSettings", () => {
        const { nodes } = withAutoSettings([makeFlowNode("s", TaskType.RESPONSE, 0, 0)], [], { s: { Model: "mistral" } }, undefined, englishSpecs);

        assert.deepEqual(
            nodes.filter((n) => n.data.parentNodeId === "s").map((n) => [n.data.settingLabel, n.data.modelName]),
            [["Model", "mistral"]],
        );
    });

    it("keeps the default specs untouched", () => {
        assert.equal(TASK_SPECS[TaskType.RESPONSE].label, "Réponse");
        assert.equal(getConfigInputs(TaskType.RESPONSE).length, 2);
    });
});

describe("handles", () => {
    it("builds and parses settings source handles", () => {
        assert.equal(settingSourceHandle("Modèle IA"), "setting-source-Modèle IA");
        assert.equal(settingInputName("setting-source-Modèle IA"), "Modèle IA");
        assert.equal(settingInputName(HandleId.MainSource), undefined);
        assert.equal(settingInputName(null), undefined);
    });
});

describe("LinearLayoutStrategy", () => {
    it("can be configured with other spacings", () => {
        const compact = new LinearLayoutStrategy({
            name: "compact",
            isVertical: false,
            gap: 100,
            initialPosition: { x: 0, y: 0 },
            settingDistance: 50,
            settingSpacing: 40,
        });
        const nodes = [makeFlowNode("a", TaskType.QUERY, 0, 0), makeFlowNode("b", TaskType.RETRIEVER, 0, 0)];

        assert.deepEqual(compact.computePlacements(nodes, [{ id: "e", source: "a", target: "b" }], "b")[0].position, {
            x: 100,
            y: 0,
        });
        assert.deepEqual(compact.getSettingOffset(1, 2), { x: 0, y: 90 });
    });
});
