import { TaskType } from "../../types/task";
import { FileText, LucideIcon } from "lucide-react";
import { ShapeType } from "../../components/nodes";
import { InstructionNode } from "../../components/nodes/SettingNodes/InstructionNode";

export const AddInstruction = {
    type: TaskType.INSTRUCTION,
    label: "Instruction",
    shape: ShapeType.CIRCLE,
    description: "LLM instruction configuration",
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
