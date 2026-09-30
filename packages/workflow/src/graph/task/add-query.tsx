import { TaskType } from "../../types/task";
import { type LucideIcon, Search } from "lucide-react";

export const AddQuery = {
    type: TaskType.QUERY,
    label: "Question",
    description: "La question posée à votre assistant",
    isEntryPoint: true,
    isEndPoint: false,
    isDeletable: false,
    icon: (props: React.ComponentProps<LucideIcon>) => (
        <Search {...props} />
    ),

    inputs: [],

    chainOutputs: [
        {
            nodeType: TaskType.REWRITER,
            optional: true,
        },
    ],
};