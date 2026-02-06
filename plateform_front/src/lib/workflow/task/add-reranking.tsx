import { ReRanker } from "components/Molecules/Nodes/Common";
import { ShapeType } from "components/Molecules/Nodes/NodeShape";
import { TaskNodeFormat, TaskParamType, TaskType } from "lib/type/task";
import { type LucideIcon, Sparkle } from "lucide-react";

export const AddReranking = {
  type: TaskType.RERANKER,
  shape: ShapeType.CIRCLE,
  label: "Re-ranker",
  description: "Re-order the documents retrieved from your database",
  icon: (props: React.ComponentProps<LucideIcon>) => {
    return <Sparkle {...props} className="stroke-blue-500" />;
  },
  isEntryPoint: true,
  isEndPoint: false,
  isDeletable: true,
  isDraggable: true,
  id: "tooltip-workflow-4",
  inputs: [
    {
      name: "ReRanking",
      type: TaskParamType.SELECT,
      helperText: "Choose a reranker for your RAG",
      required: true,
      hideHandle: true,
      items: ReRanker,
      "id-2": "tooltip-workflow-5",
    }
  ],
  outputs: [
    {
      name: "Next",
      type: TaskParamType.STRING,
    }
  ]
};