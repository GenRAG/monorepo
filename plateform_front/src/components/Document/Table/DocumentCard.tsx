import React from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import { DocumentStatusBadge } from "components/ui/DocumentStatusBadge";
import { DocumentEntity, DocumentStatus } from "types/document/document";
import { formatFileSize, getFileTypeBadgeConfig } from "utils/documentFormatters";
import { DocumentActionsMenu } from "./DocumentActionsMenu";
import BoxIcon from "components/ui/BoxIcon";
import { useGetDocumentUrlQuery } from "services/document/document";

interface DocumentCardProps {
    document: DocumentEntity;
    workspaceId: string;
    agentId: string;
    onPreview: () => void;
    onDelete: () => void;
    onRetry?: () => void;
    onDownload: () => void;
}

const DocumentThumbnail: React.FC<{ document: DocumentEntity; workspaceId: string; agentId: string }> = ({
    document,
    workspaceId,
    agentId,
}) => {
    const badge = getFileTypeBadgeConfig(document.mimeType);
    const isPdf = document.mimeType === "application/pdf";
    const isIndexed = document.status === DocumentStatus.INDEXED;

    const { data: urlData } = useGetDocumentUrlQuery(
        { workspaceId, agentId, id: document.id },
        { skip: !isPdf || !isIndexed },
    );

    if (isPdf && urlData?.url) {
        return (
            <Box w="100%" h="100%" overflow="hidden" position="relative" borderRadius="8px">
                <Box
                    as="iframe"
                    src={urlData.url}
                    title={document.name}
                    w="170%"
                    h="170%"
                    border="0"
                    scrolling="no"
                    style={{
                        transform: "scale(0.588)",
                        transformOrigin: "top left",
                        pointerEvents: "none",
                        overflow: "hidden",
                    }}
                    sx={{ "&::-webkit-scrollbar": { display: "none" } }}
                />
            </Box>
        );
    }

    return <BoxIcon letters={badge.label} />;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
    document,
    workspaceId,
    agentId,
    onPreview,
    onDelete,
    onRetry,
    onDownload,
}) => {
    return (
        <Box
            bg="surfacePrimary"
            borderWidth="1px"
            borderStyle="solid"
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
                overflow="hidden"
            >
                <DocumentThumbnail document={document} workspaceId={workspaceId} agentId={agentId} />
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
