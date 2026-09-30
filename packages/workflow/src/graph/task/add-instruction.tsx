import { TaskType } from "../../types/task";
import { FileText, LucideIcon } from "lucide-react";
import { InstructionNode } from "../../components/nodes/SettingNodes/InstructionNode";

export const AddInstruction = {
    type: TaskType.INSTRUCTION,
    label: "Instructions",
    description: "Consignes et personnalité de votre assistant",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <FileText {...props} />;
    },
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: false,
    inputs: [],
    component: InstructionNode,
};
