import { LLMSRewriter } from "../../components/nodes/Common";
import { TaskParamType, TaskType } from "../../types/task";
import { type LucideIcon, PencilIcon } from "lucide-react";

export const AddRewriter = {
    type: TaskType.REWRITER,
    label: "Reformulation",
    description: "Reformule la question pour améliorer la recherche dans vos documents.",
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: true,
    icon: (props: React.ComponentProps<LucideIcon>) => (
        <PencilIcon {...props} />
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
        },
    ],

    chainOutputs: [],
};
