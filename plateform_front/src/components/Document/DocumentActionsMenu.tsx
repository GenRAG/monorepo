import React from "react";
import { DeleteIcon, DownloadIcon, RefreshCwIcon } from "lucide-react";
import { ActionMenu } from "components/System/Molecules/ActionMenu/ActionMenu";
import { DocumentStatus } from "types/document/document";

interface DocumentActionsMenuProps {
    status: DocumentStatus;
    onDelete: () => void;
    onRetry?: () => void;
    onDownload: () => void;
}

export const DocumentActionsMenu: React.FC<DocumentActionsMenuProps> = ({
    status,
    onDelete,
    onRetry,
    onDownload,
}) => (
    <ActionMenu
        items={[
            {
                label: "Retenter l'indexation",
                icon: <RefreshCwIcon size={14} />,
                onClick: onRetry ?? onDelete,
                isHidden: status !== DocumentStatus.FAILED,
            },
            {
                label: "Supprimer",
                icon: <DeleteIcon size={14} />,
                onClick: onDelete,
                color: "red.500",
            },
            {
                label: "Télécharger",
                icon: <DownloadIcon size={14} />,
                onClick: onDownload,
            },
        ]}
    />
);
