import { LLMS } from "../../components/nodes/Common";
import { TaskParamType, TaskType } from "../../types/task";
import { type LucideIcon, Speech } from "lucide-react";
import { ShapeType } from "../../components/nodes";

export const AddResponse = {
    type: TaskType.RESPONSE,
    label: "Response",
    shape: ShapeType.CIRCLE,
    description: "Generate a response based on the question and the workflow",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Speech {...props} className="stroke-blue-500" />;
    },
    isEntryPoint: false,
    isEndPoint: true,
    isDeletable: false,
    isDraggable: true,
    id: "tooltip-workflow-4",
    inputs: [
        {
            name: "Large Language Model",
            type: TaskParamType.SELECT,
            nodeType: TaskType.MODEL,
            helperText: "Choose a LLM model for your response",
            required: true,
            hideHandle: false,
            items: LLMS,
            id: "tooltip-workflow-5",
        },
        {
            name: "Instruction Prompt",
            type: TaskParamType.STRING,
            nodeType: TaskType.INSTRUCTION,
            helperText: "Enter the instruction prompt for the response",
            required: true,
            hideHandle: false,
            items: [],
            id: "tooltip-workflow-6",
        },
    ],
    outputs: [],
};
