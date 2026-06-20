import React, { useMemo, useState } from "react";
import { Box, Skeleton, Stack, Table, Tbody, VStack, useColorModeValue } from "@chakra-ui/react";
import { grayScrollbar } from "themeNew/scrollbar";
import { DocumentEntity } from "types/document/document";
import { getFileTypeLabel } from "utils/documentFormatters";
import { DocumentCard } from "./DocumentCard";
import { DocumentRow } from "./DocumentRow";
import { DocumentEmptyState } from "../DocumentEmptyState";
import { DocumentTableHeader } from "./DocumentTableHeader";
import { DocumentFilters } from "./DocumentFilters";
import { DocumentSkeletonRow } from "./DocumentSkeletonRow";
import useUploadDocuments from "hooks/useUploadDocuments";

type TypeFilter = "PDF" | "Markdown" | "Texte" | null;
type ViewMode = "list" | "grid";

interface DocumentListProps {
    documents: DocumentEntity[];
    total: number;
    selectedFolderId: string | null;
    workspaceId: string;
    agentId: string;
    onUploadClick: () => void;
    onDocumentPreview: (document: DocumentEntity) => void;
    onDocumentDelete: (documentId: string) => void;
    onDocumentRetry?: (documentId: string) => void;
    onDocumentDownload: (documentId: string) => void;
    onOpenFolderDrawer?: () => void;
    onUploadOpen?: () => void;
    isMobile?: boolean;
    footer?: React.ReactNode;
    isLoading?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    total,
    selectedFolderId,
    workspaceId,
    agentId,
    onUploadClick,
    onDocumentPreview,
    onDocumentDelete,
    onDocumentRetry,
    onDocumentDownload,
    onOpenFolderDrawer,
    onUploadOpen,
    isMobile = false,
    isLoading = false,
    footer,
}) => {
    const [search, setSearch] = useState("");
    const [activeType, setActiveType] = useState<TypeFilter>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    const borderColor = useColorModeValue("grey.100", "grey.800");
    const tableBg = useColorModeValue("white", "grey.950");

    const filtered = useMemo(() => {
        return documents.filter((doc) => {
            const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase());
            const matchType = activeType === null || getFileTypeLabel(doc.mimeType) === activeType;
            return matchSearch && matchType;
        });
    }, [documents, search, activeType]);

    if (documents.length === 0 && !isLoading) {
        return (
            <Stack h="100%" w="100%" align="center" justify="center">
                <DocumentEmptyState
                    folderId={selectedFolderId}
                    onUploadClick={onUploadClick}
                    onOpenFolderDrawer={onOpenFolderDrawer}
                    isMobile={isMobile}
                />
            </Stack>
        );
    }

    const effectiveViewMode = isMobile ? "grid" : viewMode;

    return (
        <VStack h="100%" w="100%" minW={0} align="stretch" spacing={0}>
            <DocumentFilters
                search={search}
                onSearchChange={setSearch}
                activeType={activeType}
                onTypeChange={setActiveType}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isMobile={isMobile}
                total={total}
                onOpenUpload={onUploadOpen}
            />

            {effectiveViewMode === "grid" ? (
                <Box
                    flex={1}
                    overflowY="auto"
                    sx={grayScrollbar}
                    border="1px solid"
                    borderColor={borderColor}
                    borderTopRadius="12px"
                    p={3}
                    bg={tableBg}
                >
                    <Box
                        display="grid"
                        gridTemplateColumns={{
                            base: "repeat(2, 1fr)",
                            md: "repeat(4, 1fr)",
                        }}
                        gap={3}
                    >
                        {isLoading
                            ? Array.from({ length: 8 }).map((_, i) => (
                                  <Box
                                      key={i}
                                      borderRadius="12px"
                                      overflow="hidden"
                                      borderWidth="1px"
                                      borderStyle="solid"
                                      borderColor={borderColor}
                                  >
                                      <Skeleton h="140px" borderRadius={0} />
                                      <Box px={3} pt={2} pb={3}>
                                          <Skeleton h="13px" w="80%" mb={2} borderRadius="4px" />
                                          <Skeleton h="13px" w="50%" borderRadius="4px" />
                                      </Box>
                                  </Box>
                              ))
                            : filtered.map((doc) => (
                                  <DocumentCard
                                      key={doc.id}
                                      document={doc}
                                      workspaceId={workspaceId}
                                      agentId={agentId}
                                      onRetry={onDocumentRetry ? () => onDocumentRetry(doc.id) : undefined}
                                      onPreview={() => onDocumentPreview(doc)}
                                      onDelete={() => onDocumentDelete(doc.id)}
                                      onDownload={() => onDocumentDownload(doc.id)}
                                  />
                              ))}
                    </Box>
                    {footer && <Box mt={3}>{footer}</Box>}
                </Box>
            ) : (
                <Box
                    border="1px solid"
                    borderColor={borderColor}
                    borderTopRadius="12px"
                    overflow="auto"
                    flex={1}
                    w="100%"
                    maxW="100%"
                    minW={0}
                    sx={grayScrollbar}
                >
                    <Table variant="simple" size="sm" minW="600px" borderColor={borderColor}>
                        <DocumentTableHeader />
                        <Tbody bg={tableBg}>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => <DocumentSkeletonRow key={i} />)
                                : filtered.map((doc) => (
                                      <DocumentRow
                                          key={doc.id}
                                          document={doc}
                                          onPreview={() => onDocumentPreview(doc)}
                                          onDelete={() => onDocumentDelete(doc.id)}
                                          onRetry={onDocumentRetry ? () => onDocumentRetry(doc.id) : undefined}
                                          onDownload={() => onDocumentDownload(doc.id)}
                                      />
                                  ))}
                        </Tbody>
                    </Table>
                    {footer && (
                        <Box borderTopWidth="1px" borderTopStyle="solid" borderTopColor={borderColor}>
                            {footer}
                        </Box>
                    )}
                </Box>
            )}
        </VStack>
    );
};
