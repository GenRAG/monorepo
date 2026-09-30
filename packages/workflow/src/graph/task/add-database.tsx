import { TaskType } from "../../types/task";
import { Database, type LucideIcon } from "lucide-react";

export const AddDatabase = {
    type: TaskType.RETRIEVER,
    label: "Recherche",
    description: "Recherche les passages pertinents dans votre base de documents",
    isEntryPoint: false,
    isEndPoint: false,
    isDeletable: false,
    icon: (props: React.ComponentProps<LucideIcon>) => {
        return <Database {...props} />;
    },
    inputs: [],
    chainOutputs: [
        {
            nodeType: TaskType.RERANKER,
            optional: true,
        },
    ],
};
