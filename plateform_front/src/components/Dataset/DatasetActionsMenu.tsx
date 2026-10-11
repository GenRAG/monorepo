import { Bot, FolderOpen, Pencil, Trash2 } from "lucide-react";
import { ActionMenu } from "components/ui/ActionMenu";
import { DatasetEntity } from "types/dataset/dataset";

export type DatasetAction = "open" | "agents" | "rename" | "delete";

interface DatasetActionsMenuProps {
    dataset: DatasetEntity;
    onAction: (action: DatasetAction, dataset: DatasetEntity) => void;
    hideOpen?: boolean;
}

export const DatasetActionsMenu = ({ dataset, onAction, hideOpen = false }: DatasetActionsMenuProps) => (
    <ActionMenu
        aria-label={`Actions sur ${dataset.name}`}
        sections={[
            {
                items: [
                    {
                        label: "Ouvrir",
                        icon: <FolderOpen size={14} />,
                        onClick: () => onAction("open", dataset),
                        isHidden: hideOpen,
                    },
                    {
                        label: "Utiliser dans des agents",
                        icon: <Bot size={14} />,
                        onClick: () => onAction("agents", dataset),
                    },
                    {
                        label: "Renommer",
                        icon: <Pencil size={14} />,
                        onClick: () => onAction("rename", dataset),
                    },
                ],
            },
            {
                items: [
                    {
                        label: "Supprimer",
                        icon: <Trash2 size={14} />,
                        danger: true,
                        onClick: () => onAction("delete", dataset),
                    },
                ],
            },
        ]}
    />
);
