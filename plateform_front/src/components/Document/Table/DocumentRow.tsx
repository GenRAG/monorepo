import React from "react";
import { Badge, HStack, Td, Text, Tr, useColorModeValue } from "@chakra-ui/react";
import { DocumentStatusBadge } from "components/System/Atoms/DocumentStatusBadge";
import { DocumentEntity } from "types/document/document";
import { formatFileSize, formatDate, getFileTypeLabel, getFileTypeBadgeConfig } from "utils/documentFormatters";
import { DocumentActionsMenu } from "./DocumentActionsMenu";

interface DocumentRowProps {
    document: DocumentEntity;
    onPreview: () => void;
    onDelete: () => void;
    onRetry?: () => void;
    onDownload: () => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({ document, onPreview, onDelete, onRetry, onDownload }) => {
    const textColor = useColorModeValue("grey.800", "grey.100");

    const badge = getFileTypeBadgeConfig(document.mimeType);

    return (
        <Tr _hover={{ bg: "surfaceSubtle" }} onClick={onPreview} cursor="pointer">
            <Td>
                <HStack spacing={3}>
                    <Badge bg={badge.bg} variant="subtle" fontSize="xs" borderRadius="8px">
                        {badge.label}
                    </Badge>
                    <Text fontWeight="500" fontSize="sm" color={textColor} noOfLines={1}>
                        {document.name}
                    </Text>
                </HStack>
            </Td>
            <Td>
                <Text fontSize="sm" color="textLabel">
                    {getFileTypeLabel(document.mimeType)}
                </Text>
            </Td>
            <Td>
                <Text fontSize="sm" color="textLabel">
                    {formatFileSize(document.size)}
                </Text>
            </Td>
            <Td>
                <DocumentStatusBadge status={document.status} retryCount={document.retryCount} />
            </Td>
            <Td>
                <Text fontSize="sm" color="textLabel">
                    {formatDate(document.createdAt)}
                </Text>
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
