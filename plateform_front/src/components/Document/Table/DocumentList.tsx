import React, { useMemo, useState } from "react";
import { useViewModePreference } from "hooks/dataset/useViewModePreference";
import { Box, Skeleton, Stack, VStack } from "@chakra-ui/react";
import { grayScrollbar } from "themeNew/scrollbar";
import { DocumentEntity } from "types/document/document";
import { getFileTypeLabel } from "utils/documentFormatters";
import { DocumentCard } from "./DocumentCard";
import { DocumentTable } from "./DocumentTable";
import { DocumentEmptyState } from "../DocumentEmptyState";
import { DocumentFilters, type TypeFilter } from "./DocumentFilters";
import { DocumentSourceFilter } from "./DocumentSourceFilter";
import { DocumentSource } from "types/dataset/dataset";

interface DocumentListProps {
    documents: DocumentEntity[];
    total: number;
    selectedFolderId: string | null;
    workspaceId: string;
    datasetId: string;
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
    /** False only when the dataset itself is empty (not when the filters hide every document). */
    hasAnyDocument?: boolean;
    sourceFilter?: DocumentSource[];
    onSourceFilterChange?: (value: DocumentSource[]) => void;
    sourceCounts?: Partial<Record<DocumentSource, number>>;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    total,
    selectedFolderId,
    workspaceId,
    datasetId,
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
    hasAnyDocument = documents.length > 0,
    sourceFilter = [],
    onSourceFilterChange,
    sourceCounts = {},
}) => {
    const [search, setSearch] = useState("");
    const [activeTypes, setActiveTypes] = useState<TypeFilter[]>([]);
    const [viewMode, setViewMode] = useViewModePreference("genrag.documents.viewMode", "table");

    const filtered = useMemo(() => {
        return documents.filter((doc) => {
            const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase());
            const matchType =
                activeTypes.length === 0 || activeTypes.includes(getFileTypeLabel(doc.mimeType) as TypeFilter);
            return matchSearch && matchType;
        });
    }, [documents, search, activeTypes]);

    if (!hasAnyDocument && !isLoading) {
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
        <VStack h="100%" w="100%" minW={0} align="stretch" spacing={0} px={1}>
            <DocumentFilters
                search={search}
                onSearchChange={setSearch}
                activeTypes={activeTypes}
                onTypesChange={setActiveTypes}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isMobile={isMobile}
                total={total}
                onOpenUpload={onUploadOpen}
                extraFilters={
                    onSourceFilterChange && (
                        <DocumentSourceFilter
                            value={sourceFilter}
                            onChange={onSourceFilterChange}
                            counts={sourceCounts}
                        />
                    )
                }
            />

            {effectiveViewMode === "grid" ? (
                <Box
                    flex={1}
                    overflowY="auto"
                    sx={grayScrollbar}
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="borderDefault"
                    borderRadius="12px"
                    p={3}
                    bg="surfacePrimary"
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
                                      borderColor="borderDefault"
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
                                      datasetId={datasetId}
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
                <DocumentTable
                    documents={filtered}
                    isLoading={isLoading}
                    onPreview={onDocumentPreview}
                    onDelete={onDocumentDelete}
                    onRetry={onDocumentRetry}
                    onDownload={onDocumentDownload}
                    onUpload={onUploadOpen}
                    footer={footer}
                    groupBySource={sourceFilter.length !== 1}
                    sourceCounts={sourceCounts}
                />
            )}
        </VStack>
    );
};
