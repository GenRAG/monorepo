import { LLMS, ReRanker } from "components/Molecules/Nodes/Common";
import { ShapeType } from "components/Molecules/Nodes/NodeShape";
import { TaskParamType, TaskType } from "lib/type/task";
import { type LucideIcon, Sparkle } from "lucide-react";

export const AddReranking = {
    type: TaskType.RERANKER,
    shape: ShapeType.CIRCLE,
    label: "Re-ranker",
    description:
        "Re-order the documents retrieved from your database for better retrieval",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Sparkle {...props} className="stroke-blue-500" />;
    },
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: true,
    isDraggable: true,
    id: "tooltip-workflow-reranking",
    inputs: [
        {
            name: "ReRanking",
            type: TaskParamType.SELECT,
            nodeType: TaskType.MODEL,
            helperText: "Choose a reranker for your RAG",
            required: true,
            hideHandle: false,
            items: ReRanker,
            id: "tooltip-workflow-reranking-model",
            position: { x: 0, y: 0 },
        },
    ],
    chainOutputs: [],
};
