import { LLMS } from "../../components/nodes/Common";
import { TaskParamType, TaskType } from "../../types/task";
import { type LucideIcon, Speech } from "lucide-react";

export const AddResponse = {
    type: TaskType.RESPONSE,
    label: "Réponse",
    description: "Génère la réponse finale à partir des documents trouvés",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Speech {...props} />;
    },
    isEntryPoint: false,
    isEndPoint: true,
    isDeletable: false,
    inputs: [
        {
            name: "Modèle IA",
            type: TaskParamType.SELECT,
            nodeType: TaskType.MODEL,
            helperText: "Choisissez le modèle IA pour la génération de réponse",
            required: true,
            hideHandle: false,
            items: LLMS,
        },
        {
            name: "Instruction",
            type: TaskParamType.STRING,
            nodeType: TaskType.INSTRUCTION,
            helperText: "Rédigez les instructions de votre assistant",
            required: true,
            hideHandle: false,
            items: [],
        },
    ],
};
