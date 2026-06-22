import { LLMS } from "../../components/nodes/Common";
import { TaskParamType, TaskType } from "../../types/task";
import { type LucideIcon, Speech } from "lucide-react";
import { ShapeType } from "../../components/nodes";

export const AddResponse = {
    type: TaskType.RESPONSE,
    label: "Réponse",
    shape: ShapeType.CIRCLE,
    description: "Génère la réponse finale à partir des documents trouvés",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Speech {...props} className="stroke-blue-500" />;
    },
    isEntryPoint: false,
    isEndPoint: true,
    isDeletable: false,
    isDraggable: true,
    id: "tooltip-workflow-4",
    inputs: [
        {
            name: "Modèle IA",
            type: TaskParamType.SELECT,
            nodeType: TaskType.MODEL,
            helperText: "Choisissez le modèle IA pour la génération de réponse",
            required: true,
            hideHandle: false,
            items: LLMS,
            id: "tooltip-workflow-5",
        },
        {
            name: "Instruction",
            type: TaskParamType.STRING,
            nodeType: TaskType.INSTRUCTION,
            helperText: "Rédigez les instructions de votre assistant",
            required: true,
            hideHandle: false,
            items: [],
            id: "tooltip-workflow-6",
        },
    ],
    outputs: [],
};
