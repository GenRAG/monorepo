import { ReRanker } from "components/Molecules/Nodes/Common";
import { ShapeType } from "components/Molecules/Nodes/NodeShape";
import { TaskNodeFormat, TaskParamType, TaskType } from "lib/type/task";
import { type LucideIcon, Search, Sparkle } from "lucide-react";

export const AddQuery = {
  type: TaskType.QUERY,
  shape: ShapeType.CIRCLE,
  label: "Query",
  description: "Ask a question to your RAG",
  id: "tooltip-workflow-5",
  isEntryPoint: false,
  isEndPoint: false,
  isDeletable: false,
  isDraggable: true,
  icon: (props: React.ComponentProps<LucideIcon>) => {
    return <Search {...props} className="stroke-blue-500" />;
  },
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