import React, { useState } from "react";
import { Box, HStack, IconButton, Text, VStack, useColorMode, useDisclosure } from "@chakra-ui/react";
import WorkspaceHeader from "components/System/Molecules/WorkspaceHeader";
import { DocumentList } from "components/Document/Table/DocumentList";
import { PreviewDrawer } from "components/Document/Drawer/PreviewDrawer";
import { UploadModal } from "components/Document/Modal/UploadModal";
import { DocumentPageHeader } from "components/Document/Header/DocumentPageHeader";
import { MoveLeft, MoveRight } from "lucide-react";
import {
    useDeleteDocumentMutation,
    useGetAgentDocumentsQuery,
    useLazyGetDocumentUrlQuery,
} from "services/document/document";
import { useParams } from "react-router-dom";
import { DocumentEntity } from "types/document/document";
import { useAppResponsive } from "hooks/useAppResponsive";

const PAGE_SIZE = 10;

export const DocumentWorkspace: React.FC = () => {
    const { workspaceId, agentId } = useParams();

    const [currentPage, setCurrentPage] = useState(1);

    const { data: fetchedDocuments } = useGetAgentDocumentsQuery({
        workspaceId: workspaceId!,
        agentId: agentId!,
        page: currentPage,
        limit: PAGE_SIZE,
    });
    const [deleteDocument] = useDeleteDocumentMutation();
    const [getDocumentUrl] = useLazyGetDocumentUrlQuery();

    const documents = fetchedDocuments?.data ?? [];
    const total = fetchedDocuments?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const [selectedDocument, setSelectedDocument] = useState<DocumentEntity | null>(null);

    const uploadModal = useDisclosure();
    const previewDrawer = useDisclosure();
    const { colorMode } = useColorMode();

    const handleDocumentDelete = async (id: string) => {
        if (!workspaceId || !agentId) return;

        await deleteDocument({ workspaceId, agentId, id }).unwrap();

        if (selectedDocument?.id === id) {
            setSelectedDocument(null);
            previewDrawer.onClose();
        }

        if (documents.length === 1 && currentPage > 1) {
            setCurrentPage((p) => p - 1);
        }
    };

    const handleDocumentPreview = (doc: DocumentEntity) => {
        setSelectedDocument(doc);
        previewDrawer.onOpen();
    };

    const handleDocumentDownload = async (id: string) => {
        if (!workspaceId || !agentId) return;
        const { data } = await getDocumentUrl({ workspaceId, agentId, id });
        if (!data?.url) return;
        const a = document.createElement("a");
        a.href = data.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
    };

    const handleUploadComplete = () => {
        setCurrentPage(1);
    };

    const isMobile = useAppResponsive({ base: true, lg: false }) ?? false;

    return (
        <VStack w="100%" h="100vh" align="stretch" spacing={0} overflow="hidden" position="relative">
            <Box position="relative" zIndex={1}>
                <WorkspaceHeader
                    title="Documents"
                    description="Téléversez des documents directement dans votre agent, sans dossiers ni complexité de système de fichiers."
                />
            </Box>

            <VStack
                align="stretch"
                spacing={5}
                px={{ base: 4, md: 6 }}
                py={{ base: 4, md: 5 }}
                overflow="auto"
                flex={1}
                zIndex={1}
                position="relative"
            >
                {documents.length !== 0 && <DocumentPageHeader workspaceId={workspaceId!} agentId={agentId!} />}

                <DocumentList
                    documents={documents}
                    total={total}
                    selectedFolderId={null}
                    onUploadClick={uploadModal.onOpen}
                    onDocumentPreview={handleDocumentPreview}
                    onDocumentDelete={handleDocumentDelete}
                    onDocumentDownload={handleDocumentDownload}
                    onUploadOpen={uploadModal.onOpen}
                    isMobile={isMobile}
                />

                {totalPages > 0 && documents.length > 0 && (
                    <HStack
                        bg={colorMode === "dark" ? "grey.950" : "white"}
                        p={3}
                        borderRadius="8px"
                        justify="space-between"
                        border="1px solid"
                        borderColor={colorMode === "dark" ? "grey.700" : "grey.100"}
                    >
                        <Text>
                            Page {currentPage} sur {totalPages}
                        </Text>
                        <HStack>
                            <IconButton
                                aria-label="Page précédente"
                                icon={<MoveLeft size={16} />}
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                isDisabled={currentPage === 1}
                            />
                            <IconButton
                                aria-label="Page suivante"
                                icon={<MoveRight size={16} />}
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                isDisabled={currentPage === totalPages}
                            />
                        </HStack>
                    </HStack>
                )}
            </VStack>

            <UploadModal
                isOpen={uploadModal.isOpen}
                onClose={uploadModal.onClose}
                workspaceId={workspaceId!}
                agentId={agentId!}
                targetFolderId={null}
                onUploadComplete={handleUploadComplete}
            />

            <PreviewDrawer
                isOpen={previewDrawer.isOpen}
                onClose={() => {
                    previewDrawer.onClose();
                    setSelectedDocument(null);
                }}
                document={selectedDocument}
            />
        </VStack>
    );
};
