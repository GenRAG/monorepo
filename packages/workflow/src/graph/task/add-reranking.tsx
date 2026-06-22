import { ReRanker } from "../../components/nodes/Common";
import { TaskParamType, TaskType } from "../../types/task";
import { type LucideIcon, Sparkle } from "lucide-react";
import { ShapeType } from "../../components/nodes";

export const AddReranking = {
    type: TaskType.RERANKER,
    shape: ShapeType.CIRCLE,
    label: "Classement",
    description: "Trie les résultats par ordre de pertinence pour améliorer la réponse",
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
            name: "Modèle de tri",
            type: TaskParamType.SELECT,
            nodeType: TaskType.MODEL,
            helperText: "Choisissez le modèle de tri",
            required: true,
            hideHandle: false,
            items: ReRanker,
            id: "tooltip-workflow-reranking-model",
        },
    ],
    chainOutputs: [],
};
