import React from "react";
import {
    HStack,
    Icon,
    Td,
    Text,
    Tr,
    useColorModeValue,
} from "@chakra-ui/react";
import { DocumentStatusBadge } from "components/System/Atoms/DocumentStatusBadge";
import { DocumentEntity } from "types/document/document";
import {
    formatFileSize,
    formatDate,
    getFileTypeLabel,
    getFileIcon,
} from "utils/documentFormatters";
import { DocumentActionsMenu } from "./DocumentActionsMenu";

interface DocumentRowProps {
    document: DocumentEntity;
    onPreview: () => void;
    onDelete: () => void;
    onRetry?: () => void;
    onDownload: () => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({
    document,
    onPreview,
    onDelete,
    onRetry,
    onDownload,
}) => {
    const FileIcon = getFileIcon(document.mimeType);
    const textColor = useColorModeValue("grey.800", "grey.100");
    const hoverColor = useColorModeValue("grey.50", "grey.700");

    return (
        <Tr
            _hover={{ bg: hoverColor }}
            onClick={onPreview}
            style={{ cursor: "pointer" }}
        >
            <Td>
                <HStack spacing={3}>
                    <Icon
                        as={FileIcon as React.ElementType}
                        color={textColor}
                        fontSize="18px"
                    />
                    <Text fontWeight="medium" fontSize="sm" color={textColor}>
                        {document.name}
                    </Text>
                </HStack>
            </Td>
            <Td>
                <Text fontSize="sm" color={textColor}>
                    {getFileTypeLabel(document.mimeType)}
                </Text>
            </Td>
            <Td>
                <Text fontSize="sm" color={textColor}>
                    {formatFileSize(document.size)}
                </Text>
            </Td>
            <Td>
                <DocumentStatusBadge
                    status={document.status}
                    retryCount={document.retryCount}
                />
            </Td>
            <Td>
                <Text fontSize="sm" color={textColor}>
                    {formatDate(document.createdAt)}
                </Text>
            </Td>
            <Td onClick={(e) => e.stopPropagation()}>
                <DocumentActionsMenu
                    status={document.status}
                    onDelete={onDelete}
                    onRetry={onRetry}
                    onDownload={onDownload}
                />
            </Td>
        </Tr>
    );
};
