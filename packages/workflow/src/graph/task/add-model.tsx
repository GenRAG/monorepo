import { Position } from "@xyflow/react";
import { TaskType } from "../../types/task";
import { type LucideIcon, Brain } from "lucide-react";
import { ShapeType } from "../../components/nodes";

export const AddModel = {
    type: TaskType.MODEL,
    label: "Model",
    shape: ShapeType.CIRCLE,
    description: "LLM Model configuration",
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
        y: 0,
    },
    id: "tooltip-workflow-model",
    inputs: [],
    outputs: [],
};
