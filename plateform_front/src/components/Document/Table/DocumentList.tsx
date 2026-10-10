import React, { useMemo, useState } from "react";
import { Stack, VStack } from "@chakra-ui/react";
import { DocumentEntity } from "types/document/document";
import { getFileTypeLabel } from "utils/documentFormatters";
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

    return (
        <VStack h="100%" w="100%" minW={0} align="stretch" spacing={0} px={1}>
            <DocumentFilters
                search={search}
                onSearchChange={setSearch}
                activeTypes={activeTypes}
                onTypesChange={setActiveTypes}
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
        </VStack>
    );
};
