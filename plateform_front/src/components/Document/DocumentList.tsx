import React, { useMemo, useState } from "react";
import {
    Box,
    Stack,
    Table,
    Tbody,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { grayScrollbar } from "themeNew/scrollbar";
import { DocumentEntity } from "types/document/document";
import { getFileTypeLabel } from "utils/documentFormatters";
import { DocumentCard } from "./DocumentCard";
import { DocumentRow } from "./DocumentRow";
import { DocumentEmptyState } from "./DocumentEmptyState";
import { DocumentTableHeader } from "./DocumentTableHeader";
import { DocumentFilters } from "./DocumentFilters";

type TypeFilter = "PDF" | "Word" | "Markdown" | "Texte" | null;
type ViewMode = "list" | "grid";

interface DocumentListProps {
    documents: DocumentEntity[];
    total: number;
    selectedFolderId: string | null;
    onUploadClick: () => void;
    onDocumentPreview: (document: DocumentEntity) => void;
    onDocumentDelete: (documentId: string) => void;
    onDocumentDownload: (documentId: string) => void;
    onOpenFolderDrawer?: () => void;
    onUploadOpen?: () => void;
    isMobile?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    total,
    selectedFolderId,
    onUploadClick,
    onDocumentPreview,
    onDocumentDelete,
    onDocumentDownload,
    onOpenFolderDrawer,
    onUploadOpen,
    isMobile = false,
}) => {
    const [search, setSearch] = useState("");
    const [activeType, setActiveType] = useState<TypeFilter>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    const borderColor = useColorModeValue("grey.100", "grey.800");
    const tableBg = useColorModeValue("white", "grey.950");

    const filtered = useMemo(() => {
        return documents.filter((doc) => {
            const matchSearch = doc.name
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchType =
                activeType === null ||
                getFileTypeLabel(doc.mimeType) === activeType;
            return matchSearch && matchType;
        });
    }, [documents, search, activeType]);

    if (documents.length === 0) {
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
                    borderRadius="8px"
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
                        {filtered.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onPreview={() => onDocumentPreview(doc)}
                                onDelete={() => onDocumentDelete(doc.id)}
                                onDownload={() => onDocumentDownload(doc.id)}
                            />
                        ))}
                    </Box>
                </Box>
            ) : (
                <Box
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="8px"
                    overflow="auto"
                    flex={1}
                    w="100%"
                    maxW="100%"
                    minW={0}
                    sx={grayScrollbar}
                >
                    <Table
                        variant="simple"
                        size="sm"
                        minW="600px"
                        borderColor={borderColor}
                    >
                        <DocumentTableHeader />
                        <Tbody bg={tableBg}>
                            {filtered.map((doc) => (
                                <DocumentRow
                                    key={doc.id}
                                    document={doc}
                                    onPreview={() => onDocumentPreview(doc)}
                                    onDelete={() => onDocumentDelete(doc.id)}
                                    onDownload={() =>
                                        onDocumentDownload(doc.id)
                                    }
                                />
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </VStack>
    );
};
