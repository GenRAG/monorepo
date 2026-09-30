import { ReRanker } from "../../components/nodes/Common";
import { TaskParamType, TaskType } from "../../types/task";
import { type LucideIcon, Sparkle } from "lucide-react";

export const AddReranking = {
    type: TaskType.RERANKER,
    label: "Classement",
    description: "Trie les résultats par ordre de pertinence pour améliorer la réponse",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Sparkle {...props} />;
    },
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: true,
    inputs: [
        {
            name: "Modèle de tri",
            type: TaskParamType.SELECT,
            nodeType: TaskType.MODEL,
            helperText: "Choisissez le modèle de tri",
            required: true,
            hideHandle: false,
            items: ReRanker,
        },
    ],
    chainOutputs: [],
};
