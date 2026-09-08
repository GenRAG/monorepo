import React from "react";
import { HStack, Td, Text, Tr } from "@chakra-ui/react";
import { DocumentStatusBadge } from "components/ui/DocumentStatusBadge";
import { DocumentEntity } from "types/document/document";
import { formatFileSize, formatDate, getFileTypeLabel, getFileTypeBadgeConfig } from "utils/documentFormatters";
import { DocumentActionsMenu } from "./DocumentActionsMenu";
import BoxIcon from "components/ui/BoxIcon";

interface DocumentRowProps {
    document: DocumentEntity;
    onPreview: () => void;
    onDelete: () => void;
    onRetry?: () => void;
    onDownload: () => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({ document, onPreview, onDelete, onRetry, onDownload }) => {
    const badge = getFileTypeBadgeConfig(document.mimeType);

    return (
        <Tr _hover={{ bg: "surfaceSubtle" }} onClick={onPreview} cursor="pointer">
            <Td>
                <HStack spacing={3}>
                    <BoxIcon size="sm" letters={badge.label} />
                    <Text fontWeight="500" fontSize="xs" color="textPrimary" noOfLines={1}>
                        {document.name}
                    </Text>
                </HStack>
            </Td>
            <Td>
                <Text variant="body-xs-muted">{getFileTypeLabel(document.mimeType)}</Text>
            </Td>
            <Td>
                <Text variant="body-xs-muted">{formatFileSize(document.size)}</Text>
            </Td>
            <Td>
                <DocumentStatusBadge status={document.status} retryCount={document.retryCount} />
            </Td>
            <Td>
                <Text variant="body-xs-muted">{formatDate(document.createdAt)}</Text>
            </Td>
            <Td onClick={(e) => e.stopPropagation()}>
                <HStack spacing={1} justify="flex-end">
                    <DocumentActionsMenu
                        status={document.status}
                        onDelete={onDelete}
                        onRetry={onRetry}
                        onDownload={onDownload}
                    />
                </HStack>
            </Td>
        </Tr>
    );
};
