import React from "react";
import { Trash2, Download, RefreshCw } from "lucide-react";
import { ActionMenu } from "components/System/Molecules/ActionMenu/ActionMenu";
import { DocumentStatus } from "types/document/document";

interface DocumentActionsMenuProps {
    status: DocumentStatus;
    onDelete: () => void;
    onRetry?: () => void;
    onDownload: () => void;
}

export const DocumentActionsMenu: React.FC<DocumentActionsMenuProps> = ({ status, onDelete, onRetry, onDownload }) => (
    <ActionMenu
        items={[
            {
                label: "Retenter l'indexation",
                icon: <RefreshCw size={14} />,
                onClick: onRetry ?? onDelete,
                isHidden: status !== DocumentStatus.FAILED,
            },
            {
                label: "Télécharger",
                icon: <Download size={14} />,
                onClick: onDownload,
            },
            {
                label: "Supprimer",
                icon: <Trash2 size={14} />,
                onClick: onDelete,
                danger: true,
            },
        ]}
    />
);
