import { ReRanker } from "components/Molecules/Nodes/Common";
import { ShapeType } from "components/Molecules/Nodes/NodeShape";
import { TaskNodeFormat, TaskParamType, TaskType } from "lib/type/task";
import { Database, type LucideIcon } from "lucide-react";

export const AddDatabase = {
  type: TaskType.RETRIEVER,
  shape: ShapeType.HEXAGON,
  label: "Retriever",
  description: "Retrieve documents from your database",
  id: "tooltip-workflow-4",
  isEntryPoint: true,
  isEndPoint: false,
  isDeletable: false,
  isDraggable: true,
  icon: (props: React.ComponentProps<LucideIcon>) => {
    return <Database {...props} className="stroke-blue-500" />;
  },
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
    }
  ]
};