import { TaskType } from "../../types/task";
import { Database, type LucideIcon } from "lucide-react";
import { ShapeType } from "../../components/nodes";

export const AddDatabase = {
    type: TaskType.RETRIEVER,
    shape: ShapeType.HEXAGON,
    label: "Recherche",
    description: "Recherche les passages pertinents dans votre base de documents",
    id: "tooltip-workflow-retriever",
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: false,
    isDraggable: true,
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Database {...props} className="stroke-blue-500" />;
    },
    inputs: [],
    chainOutputs: [
        {
            nodeType: TaskType.RERANKER,
            optional: true,
        },
    ],
};
