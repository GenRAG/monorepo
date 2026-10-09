import { linkNodes, makeFlowNode, TaskType, withAutoSettings } from "@genrag/workflow";

/** Workflow of an agent created without a template: shown in the creation preview and saved as is. */
export const BLANK_WORKFLOW = withAutoSettings(
    [
        makeFlowNode("q", TaskType.QUERY, 270, -50),
        makeFlowNode("r", TaskType.RETRIEVER, 270, 180),
        makeFlowNode("s", TaskType.RESPONSE, 620, 240),
    ],
    [linkNodes("q", "r"), linkNodes("r", "s")],
);
