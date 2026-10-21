import type { ModelStep, OptionalStep, Pipeline } from "./model";

/** Every edit the builder can make. A command that changes nothing returns the same pipeline object. */
export type PipelineCommand =
    | { type: "addStep"; step: OptionalStep }
    | { type: "removeStep"; step: OptionalStep }
    | { type: "setModel"; step: ModelStep; model: string }
    | { type: "setInstruction"; instruction: string }
    | { type: "addDataset"; datasetId: string }
    | { type: "removeDataset"; datasetId: string };

/** Pure reducer: usable as is with `useReducer`, and replayable on the server or in a test. */
export function applyCommand(pipeline: Pipeline, command: PipelineCommand): Pipeline {
    switch (command.type) {
        case "addStep":
            return pipeline[command.step] ? pipeline : { ...pipeline, [command.step]: { model: null } };
        case "removeStep":
            return pipeline[command.step] ? { ...pipeline, [command.step]: null } : pipeline;
        case "setModel": {
            const step = pipeline[command.step];
            if (!step || step.model === command.model) return pipeline;
            return { ...pipeline, [command.step]: { ...step, model: command.model } };
        }
        case "setInstruction":
            return pipeline.answer.instruction === command.instruction
                ? pipeline
                : { ...pipeline, answer: { ...pipeline.answer, instruction: command.instruction } };
        case "addDataset": {
            const { datasetIds } = pipeline.retrieve;
            if (datasetIds.includes(command.datasetId)) return pipeline;
            return { ...pipeline, retrieve: { datasetIds: [...datasetIds, command.datasetId] } };
        }
        case "removeDataset": {
            const { datasetIds } = pipeline.retrieve;
            if (!datasetIds.includes(command.datasetId)) return pipeline;
            return { ...pipeline, retrieve: { datasetIds: datasetIds.filter((id) => id !== command.datasetId) } };
        }
    }
}
