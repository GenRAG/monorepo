import { ShapeType } from "components/Molecules/Nodes/NodeShape";
import { TaskType } from "lib/type/task";
import { type LucideIcon, Search } from "lucide-react";

export const AddQuery = {
    type: TaskType.QUERY,
    shape: ShapeType.CIRCLE,
    label: "Query",
    description: "Question you ask to your assistant",
    id: "tooltip-workflow-5",
    isEntryPoint: true,
    isEndPoint: false,
    isDeletable: false,
    isDraggable: true,
    icon: (props: React.ComponentProps<LucideIcon>) => (
        <Search {...props} className="stroke-blue-500" />
    ),

    inputs: [],

    chainOutputs: [
        {
            nodeType: TaskType.REWRITER,
            optional: true,
            position: { x: 0, y: 100 },
        },
    ],
};