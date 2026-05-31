import React from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import { Copy } from "lucide-react";
import { DocumentStatusBadge } from "components/System/Atoms/DocumentStatusBadge";
import { DocumentEntity } from "types/document/document";
import { formatFileSize, getFileTypeBadgeConfig } from "utils/documentFormatters";
import { DocumentActionsMenu } from "./DocumentActionsMenu";

interface DocumentCardProps {
    document: DocumentEntity;
    onPreview: () => void;
    onDelete: () => void;
    onRetry?: () => void;
    onDownload: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onPreview, onDelete, onRetry, onDownload }) => {
    const badge = getFileTypeBadgeConfig(document.mimeType);

    return (
        <Box
            bg="surfacePrimary"
            border="1px solid"
            borderColor="borderDefault"
            borderRadius="12px"
            overflow="hidden"
            cursor="pointer"
            onClick={onPreview}
            _hover={{ bg: "surfaceHover" }}
            transition="background 0.15s"
        >
            <Box
                bg="surfaceThumbnail"
                h="140px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
            >
                <Box
                    as="span"
                    bg={badge.bg}
                    color={badge.color}
                    fontSize="13px"
                    fontWeight="700"
                    letterSpacing="0.06em"
                    px={4}
                    py={6}
                    borderRadius="6px"
                >
                    {badge.label}
                </Box>
                <Box position="absolute" top={2} right={2} color="textLabel">
                    <Copy size={13} />
                </Box>
            </Box>

            <Box px={3} pt={2} pb={3}>
                <Text fontSize="13px" fontWeight="500" color="textPrimary" noOfLines={2} lineHeight="1.4" mb={2}>
                    {document.name}
                </Text>

                <HStack justify="space-between" align="center">
                    <DocumentStatusBadge status={document.status} retryCount={document.retryCount} />
                    <HStack spacing={1} align="center">
                        <Text fontSize="11px" color="textMuted">
                            {formatFileSize(document.size)}
                        </Text>
                        <Box onClick={(e) => e.stopPropagation()}>
                            <DocumentActionsMenu
                                status={document.status}
                                onDelete={onDelete}
                                onRetry={onRetry}
                                onDownload={onDownload}
                            />
                        </Box>
                    </HStack>
                </HStack>
            </Box>
        </Box>
    );
};
