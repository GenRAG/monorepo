import React from "react";
import {
    Box,
    HStack,
    Icon,
    Text,
    VStack,
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

interface DocumentCardProps {
    document: DocumentEntity;
    onPreview: () => void;
    onDelete: () => void;
    onRetry?: () => void;
    onDownload: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
    document,
    onPreview,
    onDelete,
    onRetry,
    onDownload,
}) => {
    const FileIconComponent = getFileIcon(document.mimeType);
    const textColor = useColorModeValue("grey.800", "grey.100");
    const borderColor = useColorModeValue("grey.200", "grey.600");
    const bgColor = useColorModeValue("white", "grey.800");
    const hoverBg = useColorModeValue("grey.50", "grey.700");

    return (
        <Box
            p={4}
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
            bg={bgColor}
            cursor="pointer"
            onClick={onPreview}
            _hover={{ bg: hoverBg }}
            transition="background 0.2s"
        >
            <HStack justify="space-between" align="flex-start" spacing={3}>
                <HStack spacing={3} flex={1} minW={0}>
                    <Icon
                        as={FileIconComponent as React.ElementType}
                        color={textColor}
                        fontSize="20px"
                        flexShrink={0}
                    />
                    <VStack align="stretch" spacing={0} flex={1} minW={0}>
                        <Text
                            fontWeight="medium"
                            fontSize="sm"
                            color={textColor}
                            noOfLines={2}
                        >
                            {document.name}
                        </Text>
                        <HStack spacing={2} mt={1} flexWrap="wrap">
                            <Text fontSize="xs" color="grey.500">
                                {getFileTypeLabel(document.mimeType)}
                            </Text>
                            <Text fontSize="xs" color="grey.500">
                                •
                            </Text>
                            <Text fontSize="xs" color="grey.500">
                                {formatFileSize(document.size)}
                            </Text>
                            <Text fontSize="xs" color="grey.500">
                                •
                            </Text>
                            <Text fontSize="xs" color="grey.500">
                                {formatDate(document.createdAt)}
                            </Text>
                        </HStack>
                        <Box mt={2}>
                            <DocumentStatusBadge
                                status={document.status}
                                retryCount={document.retryCount}
                            />
                        </Box>
                    </VStack>
                </HStack>
                <Box onClick={(e) => e.stopPropagation()}>
                    <DocumentActionsMenu
                        status={document.status}
                        onDelete={onDelete}
                        onRetry={onRetry}
                        onDownload={onDownload}
                    />
                </Box>
            </HStack>
        </Box>
    );
};
