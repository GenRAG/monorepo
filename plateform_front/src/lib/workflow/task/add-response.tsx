import { ReRanker } from "components/Molecules/Nodes/Common";
import { ShapeType } from "components/Molecules/Nodes/NodeShape";
import { TaskNodeFormat, TaskParamType, TaskType } from "lib/type/task";
import { type LucideIcon, Speech } from "lucide-react";

export const AddResponse = {
    type: TaskType.RESPONSE,
    label: "Response",
    shape: ShapeType.CIRCLE,
    description: "Generate a response to the question",
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
        name: "ReRanking",
        type: TaskParamType.SELECT,
        helperText: "Choose a reranker for your RAG",
        required: true,
        hideHandle: false,
        items: ReRanker,
        "id-2": "tooltip-workflow-5",
      }
    ],
    outputs: [
      {
        name: "Next",
        type: TaskParamType.STRING,
        hideHandle: true,
      }
    ]
};