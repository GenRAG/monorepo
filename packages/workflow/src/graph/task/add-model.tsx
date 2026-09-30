import { TaskType } from "../../types/task";
import { type LucideIcon, Brain } from "lucide-react";
import { ModelNode } from "../../components/nodes/SettingNodes/ModelNode";

export const AddModel = {
    type: TaskType.MODEL,
    label: "Modèle IA",
    description: "Comparez et sélectionnez un modèle d'IA pour votre bloc.",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Brain {...props} />;
    },
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: false,
    inputs: [],
    component: ModelNode,
};
