import { LLMSRewriter } from "../../components/nodes/Common";
import { TaskParamType, TaskType } from "../../types/task";
import { type LucideIcon, PencilIcon } from "lucide-react";
import { ShapeType } from "../../components/nodes";

export const AddRewriter = {
    type: TaskType.REWRITER,
    shape: ShapeType.CIRCLE,
    label: "Reformulation",
    description: "Reformule la question pour améliorer la recherche dans vos documents.",
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
            name: "Modèle de reformulation",
            type: TaskParamType.SELECT,
            nodeType: TaskType.MODEL,
            helperText: "Choisissez le modèle IA pour la reformulation",
            required: true,
            hideHandle: false,
            items: LLMSRewriter,
            id: "tooltip-workflow-rewriter-llm",
        },
    ],

    chainOutputs: [],
};
