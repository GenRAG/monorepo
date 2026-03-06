import { LLMSRewriter } from "components/Molecules/Nodes/Common";
import { ShapeType } from "components/Molecules/Nodes/NodeShape";
import { TaskParamType, TaskType } from "lib/type/task";
import { type LucideIcon, PencilIcon } from "lucide-react";

export const AddRewriter = {
    type: TaskType.REWRITER,
    shape: ShapeType.CIRCLE,
    label: "Rewriter",
    description: "Rewrites the user query to improve retrieval from the knowledge base.",
    id: "tooltip-workflow-rewriter",
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: true,
    isDraggable: true,
    icon: (props: React.ComponentProps<LucideIcon>) => (
        <PencilIcon {...props} className="stroke-blue-500" />
    ),

    inputs: [
        {
            name: "Large Language Model",
            type: TaskParamType.SELECT,
            nodeType: TaskType.MODEL,
            helperText: "Choose a LLM model for your rewriter",
            required: true,
            hideHandle: false,
            items: LLMSRewriter,
            id: "tooltip-workflow-rewriter-llm",
            position: { x: 300, y: 50 },
        },
    ],

    chainOutputs: [],
};
