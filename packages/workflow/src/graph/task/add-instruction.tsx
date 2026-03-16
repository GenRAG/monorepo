import { Position } from "@xyflow/react";
import { TaskType } from "../../types/task";
import { Brain, LucideIcon } from "lucide-react";
import { ShapeType } from "../../components/nodes";

export const AddInstruction = {
    type: TaskType.INSTRUCTION,
    label: "Instruction",
    shape: ShapeType.CIRCLE,
    description: "LLM instruction configuration",
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Brain {...props} className="stroke-blue-500" />;
    },
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: false,
    isDraggable: true,
    sourcePosition: Position.Left,
    position: {
        x: 0,
        y: -100,
    },
    id: "tooltip-workflow-instruction",
    inputs: [],
    outputs: [],
};
