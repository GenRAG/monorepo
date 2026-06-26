import React, { useEffect, useMemo, useState } from "react";
import { HStack, IconButton, Text, VStack, useColorMode, useDisclosure } from "@chakra-ui/react";
import { DocumentList } from "components/Document/Table/DocumentList";
import { PreviewDrawer } from "components/Document/Drawer/PreviewDrawer";
import { UploadModal } from "components/Document/Modal/UploadModal";
import { DocumentPageHeader } from "components/Document/Header/DocumentPageHeader";
import { MoveLeft, MoveRight } from "lucide-react";
import {
    useDeleteDocumentMutation,
    useGetAgentDocumentsQuery,
    useLazyGetDocumentUrlQuery,
    useRetryDocumentMutation,
} from "services/document/document";
import { useParams } from "react-router-dom";
import { DocumentEntity, DocumentStatus } from "types/document/document";
import { useAppResponsive } from "hooks/useAppResponsive";
import useThemedToast from "hooks/useThemedToast";

const PAGE_SIZE = 9;

export const DocumentWorkspace: React.FC = () => {
    const { workspaceId, agentId } = useParams();
    const toast = useThemedToast();

    const [currentPage, setCurrentPage] = useState(1);
    const [pollingInterval, setPollingInterval] = useState(0);

    const { data: fetchedDocuments, isLoading } = useGetAgentDocumentsQuery(
        { workspaceId: workspaceId!, agentId: agentId!, page: currentPage, limit: PAGE_SIZE },
        { pollingInterval },
    );
    const [deleteDocument] = useDeleteDocumentMutation();
    const [retryDocument] = useRetryDocumentMutation();
    const [getDocumentUrl] = useLazyGetDocumentUrlQuery();

    const documents = useMemo(() => fetchedDocuments?.data ?? [], [fetchedDocuments]);

    useEffect(() => {
        const hasActive = documents.some(
            (d) => d.status === DocumentStatus.PROCESSING || d.status === DocumentStatus.UPLOADED,
        );
        setPollingInterval(hasActive ? 3000 : 0);
    }, [documents]);
    const total = useMemo(() => fetchedDocuments?.total ?? 0, [fetchedDocuments]);
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

    const handleDocumentRetry = async (id: string) => {
        if (!workspaceId || !agentId) return;
        await retryDocument({ workspaceId, agentId, id })
            .unwrap()
            .catch((error: any) => {
                toast({
                    title: "Erreur lors de la réindexation",
                    description:
                        error.data?.error?.message ||
                        "Une erreur est survenue lors de la réindexation du document. Veuillez réessayer plus tard.",
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                });
            });
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
            <VStack
                align="stretch"
                spacing={0}
                px={{ base: 12, md: 16 }}
                py={{ base: 12, md: 16 }}
                overflow="auto"
                flex={1}
                zIndex={1}
                position="relative"
            >
                <DocumentList
                    documents={documents}
                    total={total}
                    selectedFolderId={null}
                    workspaceId={workspaceId!}
                    agentId={agentId!}
                    onUploadClick={uploadModal.onOpen}
                    onDocumentPreview={handleDocumentPreview}
                    onDocumentDelete={handleDocumentDelete}
                    onDocumentRetry={handleDocumentRetry}
                    onDocumentDownload={handleDocumentDownload}
                    onUploadOpen={uploadModal.onOpen}
                    isMobile={isMobile}
                    isLoading={isLoading}
                    footer={
                        totalPages > 1 && documents.length > 0 ? (
                            <HStack p={3} justify="space-between" bg={colorMode === "dark" ? "grey.950" : "white"}>
                                <Text fontSize="sm">
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
                        ) : undefined
                    }
                />
                {documents.length !== 0 && <DocumentPageHeader workspaceId={workspaceId!} agentId={agentId!} />}
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
