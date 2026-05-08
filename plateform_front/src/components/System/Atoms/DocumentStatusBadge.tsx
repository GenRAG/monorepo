import React from "react";
import { Badge, Box, HStack, Spinner } from "@chakra-ui/react";
import { DocumentEntity } from "types/document/document";

interface DocumentStatusBadgeProps {
    status: DocumentEntity["status"];
    retryCount?: number;
}

const STATUS_CONFIG = {
    UPLOADED: { label: "TÉLÉVERSÉ", bg: "grey", spinner: false },
    PROCESSING: { label: "EN COURS", bg: "orange", spinner: true },
    INDEXED: { label: "INDEXÉ", bg: "green", spinner: false },
    FAILED: { label: "ÉCHEC", bg: "red", spinner: false },
} as const;

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
    status,
    retryCount,
}) => {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.UPLOADED;
    const label =
        config.spinner && retryCount && retryCount > 0
            ? `${config.label} (${retryCount}/5)`
            : config.label;

    return (
        <Badge colorScheme={config.bg} size="sm">
            <HStack spacing={1}>
                {config.spinner && <Spinner size="xs" color="white" />}
                <span>{label}</span>
            </HStack>
        </Badge>
    );
};
