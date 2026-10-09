import React from "react";
import { Box, HStack, Icon, Td, Text, Tr, VStack } from "@chakra-ui/react";
import { Clock } from "lucide-react";
import { DocumentStatusBadge } from "components/ui/DocumentStatusBadge";
import BoxIcon from "components/ui/BoxIcon";
import { DocumentEntity } from "types/document/document";
import { formatFileSize, getFileTypeBadgeConfig, getFileTypeLabel } from "utils/documentFormatters";
import { formatRelativeDate } from "utils/date";
import { getDocumentSourceLabel } from "utils/dataset/documentSource";
import { DocumentActionsMenu } from "./DocumentActionsMenu";

interface DocumentRowProps {
    document: DocumentEntity;
    hoverBg: string;
    onPreview: () => void;
    onDelete: () => void;
    onRetry?: () => void;
    onDownload: () => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({
    document,
    hoverBg,
    onPreview,
    onDelete,
    onRetry,
    onDownload,
}) => {
    const badge = getFileTypeBadgeConfig(document.mimeType);

    return (
        <Tr cursor="pointer" _hover={{ bg: hoverBg }} onClick={onPreview}>
            <Td maxW="360px">
                <HStack spacing={3}>
                    <BoxIcon size="md" letters={badge.label} bg={badge.bg} color={badge.color} />
                    <VStack align="start" spacing={0} minW={0}>
                        <Text fontSize="sm" fontWeight="600" color="textStrong" noOfLines={1} wordBreak="break-all">
                            {document.name}
                        </Text>
                        <Text fontSize="xs" color="textLabel" noOfLines={1}>
                            {getFileTypeLabel(document.mimeType)}
                        </Text>
                    </VStack>
                </HStack>
            </Td>
            <Td>
                <Text fontSize="sm" color="textBody" whiteSpace="nowrap">
                    {getDocumentSourceLabel(document.source)}
                </Text>
            </Td>
            <Td>
                <Text fontSize="sm" color="textMuted" whiteSpace="nowrap">
                    {formatFileSize(document.size)}
                </Text>
            </Td>
            <Td>
                <DocumentStatusBadge status={document.status} retryCount={document.retryCount} />
            </Td>
            <Td>
                <HStack spacing={1.5}>
                    <Icon as={Clock} boxSize={3} color="textLabel" />
                    <Text fontSize="sm" color="textMuted" whiteSpace="nowrap">
                        {formatRelativeDate(document.createdAt)}
                    </Text>
                </HStack>
            </Td>
            <Td onClick={(e) => e.stopPropagation()}>
                <Box display="flex" justifyContent="flex-end">
                    <DocumentActionsMenu
                        status={document.status}
                        onDelete={onDelete}
                        onRetry={onRetry}
                        onDownload={onDownload}
                    />
                </Box>
            </Td>
        </Tr>
    );
};
