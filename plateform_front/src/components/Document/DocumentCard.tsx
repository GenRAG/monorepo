import React from "react";
import { Box, HStack, Text, useColorModeValue } from "@chakra-ui/react";
import { Copy } from "lucide-react";
import { DocumentStatusBadge } from "components/System/Atoms/DocumentStatusBadge";
import { DocumentEntity } from "types/document/document";
import {
    formatFileSize,
    getFileTypeBadgeConfig,
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
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const cardBg = useColorModeValue("white", "grey.950");
    const hoverBg = useColorModeValue("grey.50", "grey.900");
    const thumbnailBg = useColorModeValue("grey.100", "grey.850");
    const textColor = useColorModeValue("grey.800", "grey.100");
    const mutedColor = useColorModeValue("grey.400", "grey.500");
    const iconColor = useColorModeValue("grey.300", "grey.600");

    const badge = getFileTypeBadgeConfig(document.mimeType);

    return (
        <Box
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="12px"
            overflow="hidden"
            cursor="pointer"
            onClick={onPreview}
            _hover={{ bg: hoverBg }}
            transition="background 0.15s"
        >
            <Box
                bg={thumbnailBg}
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
                    px={3}
                    py="6px"
                    borderRadius="6px"
                >
                    {badge.label}
                </Box>
                <Box position="absolute" top={2} right={2} color={iconColor}>
                    <Copy size={13} />
                </Box>
            </Box>

            <Box px={3} pt={2} pb={3}>
                <Text
                    fontSize="13px"
                    fontWeight="500"
                    color={textColor}
                    noOfLines={2}
                    lineHeight="1.4"
                    mb={2}
                >
                    {document.name}
                </Text>

                <HStack justify="space-between" align="center">
                    <DocumentStatusBadge
                        status={document.status}
                        retryCount={document.retryCount}
                    />
                    <HStack spacing={1} align="center">
                        <Text fontSize="11px" color={mutedColor}>
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
