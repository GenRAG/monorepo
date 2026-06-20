import { TaskType } from "../../types/task";
import { type LucideIcon, Brain } from "lucide-react";
import { ShapeType } from "../../components/nodes";
import { ModelNode } from "../../components/nodes/SettingNodes/ModelNode";

export const AddModel = {
    type: TaskType.MODEL,
    label: "Modèle IA",
    shape: ShapeType.CIRCLE,
    description: "Modèle d'intelligence artificielle",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Brain {...props} className="stroke-blue-500" />;
    },
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: false,
    isDraggable: true,
    id: "tooltip-workflow-model",
    inputs: [],
    outputs: [],
    component: ModelNode,
};
