import { TaskType } from "../../types/task";
import { FileText, LucideIcon } from "lucide-react";
import { ShapeType } from "../../components/nodes";
import { InstructionNode } from "../../components/nodes/SettingNodes/InstructionNode";

export const AddInstruction = {
    type: TaskType.INSTRUCTION,
    label: "Instructions",
    shape: ShapeType.CIRCLE,
    description: "Consignes et personnalité de votre assistant",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <FileText {...props} className="stroke-blue-500" />;
    },
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: false,
    isDraggable: true,
    id: "tooltip-workflow-instruction",
    inputs: [],
    outputs: [],
    component: InstructionNode,
};
