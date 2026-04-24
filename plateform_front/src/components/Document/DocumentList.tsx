import React from "react";
import {
    Box,
    Table,
    Tbody,
    Thead,
    Th,
    Tr,
    VStack,
    Stack,
} from "@chakra-ui/react";
import { grayScrollbar } from "themeNew/scrollbar";
import { DocumentEntity } from "types/document/document";
import { DocumentCard } from "./DocumentCard";
import { DocumentRow } from "./DocumentRow";
import { DocumentEmptyState } from "./DocumentEmptyState";

interface DocumentListProps {
    documents: DocumentEntity[];
    selectedFolderId: string | null;
    onUploadClick: () => void;
    onDocumentPreview: (document: DocumentEntity) => void;
    onDocumentDelete: (documentId: string) => void;
    onDocumentDownload: (documentId: string) => void;
    onOpenFolderDrawer?: () => void;
    isMobile?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    selectedFolderId,
    onUploadClick,
    onDocumentPreview,
    onDocumentDelete,
    onDocumentDownload,
    onOpenFolderDrawer,
    isMobile = false,
}) => {
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

    return (
        <VStack h="100%" w="100%" minW={0} align="stretch" spacing={0}>
            {isMobile ? (
                <Box flex={1} overflowY="auto" sx={grayScrollbar}>
                    <VStack spacing={3} align="stretch">
                        {documents.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onPreview={() => onDocumentPreview(doc)}
                                onDelete={() => onDocumentDelete(doc.id)}
                                onDownload={() => onDocumentDownload(doc.id)}
                            />
                        ))}
                    </VStack>
                </Box>
            ) : (
                <Box
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="borderSubtle"
                    overflow="auto"
                    flex={1}
                    w="100%"
                    maxW="100%"
                    minW={0}
                >
                    <Table variant="simple" size="sm" minW="600px">
                        <Thead
                            position="sticky"
                            top={0}
                            padding={5}
                            bg="surfacePrimary"
                            zIndex={1}
                            color="textPrimary"
                        >
                            <Tr>
                                <Th>Nom</Th>
                                <Th>Type</Th>
                                <Th>Taille</Th>
                                <Th>Statut</Th>
                                <Th>Téléversé</Th>
                                <Th width="100px">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody bg="tableBg">
                            {documents.map((doc) => (
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
