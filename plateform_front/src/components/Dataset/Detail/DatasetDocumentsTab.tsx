import React, { useEffect, useMemo, useState } from "react";
import { HStack, IconButton, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { DocumentList } from "components/Document/Table/DocumentList";
import { PreviewDrawer } from "components/Document/Drawer/PreviewDrawer";
import { UploadModal } from "components/Document/Modal/UploadModal";
import { MoveLeft, MoveRight } from "lucide-react";
import {
    useDeleteDocumentMutation,
    useGetDatasetDocumentsQuery,
    useGetDatasetDocumentStatsQuery,
    useLazyGetDocumentUrlQuery,
    useRetryDocumentMutation,
} from "services/document/document";
import { DocumentEntity, DocumentStatus } from "types/document/document";
import { useAppResponsive } from "hooks/useAppResponsive";
import useThemedToast from "hooks/useThemedToast";
import { getApiErrorMessage } from "utils/apiError";
import { DocumentSource } from "types/dataset/dataset";

const PAGE_SIZE = 8;

interface DatasetDocumentsTabProps {
    workspaceId: string;
    datasetId: string;
    /** Owned by the page so the Sources tab can open the upload too. */
    uploadModal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
}

export const DatasetDocumentsTab: React.FC<DatasetDocumentsTabProps> = ({ workspaceId, datasetId, uploadModal }) => {
    const toast = useThemedToast();

    const [currentPage, setCurrentPage] = useState(1);
    const [pollingInterval, setPollingInterval] = useState(0);
    const [sourceFilter, setSourceFilter] = useState<DocumentSource[]>([]);

    const { data: fetchedDocuments, isLoading } = useGetDatasetDocumentsQuery(
        {
            workspaceId,
            datasetId,
            page: currentPage,
            limit: PAGE_SIZE,
            sources: sourceFilter,
        },
        { pollingInterval },
    );
    const { data: stats } = useGetDatasetDocumentStatsQuery({ workspaceId, datasetId });

    const handleSourceFilterChange = (value: DocumentSource[]) => {
        setSourceFilter(value);
        setCurrentPage(1);
    };
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

    const previewDrawer = useDisclosure();

    const handleDocumentDelete = async (id: string) => {
        if (!workspaceId || !datasetId) return;

        try {
            await deleteDocument({ workspaceId, datasetId, id }).unwrap();
        } catch (error: unknown) {
            toast({
                title: "Erreur lors de la suppression",
                description:
                    getApiErrorMessage(error) || "Le document n'a pas pu être supprimé. Veuillez réessayer plus tard.",
                status: "error",
                duration: 9000,
                isClosable: true,
            });
            return;
        }

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
        if (!workspaceId || !datasetId) return;
        await retryDocument({ workspaceId, datasetId, id })
            .unwrap()
            .catch((error: unknown) => {
                toast({
                    title: "Erreur lors de la réindexation",
                    description:
                        getApiErrorMessage(error) ||
                        "Une erreur est survenue lors de la réindexation du document. Veuillez réessayer plus tard.",
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                });
            });
    };

    const handleDocumentDownload = async (id: string) => {
        if (!workspaceId || !datasetId) return;
        const { data } = await getDocumentUrl({ workspaceId, datasetId, id });
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
        <VStack w="100%" h="100%" align="stretch" spacing={0} overflow="hidden" position="relative">
            <VStack align="stretch" spacing={0} pt={4} overflow="auto" flex={1} zIndex={1} position="relative">
                <DocumentList
                    documents={documents}
                    total={total}
                    selectedFolderId={null}
                    workspaceId={workspaceId}
                    datasetId={datasetId}
                    onUploadClick={uploadModal.onOpen}
                    onDocumentPreview={handleDocumentPreview}
                    onDocumentDelete={handleDocumentDelete}
                    onDocumentRetry={handleDocumentRetry}
                    onDocumentDownload={handleDocumentDownload}
                    onUploadOpen={uploadModal.onOpen}
                    isMobile={isMobile}
                    isLoading={isLoading}
                    hasAnyDocument={(stats?.total ?? total) > 0}
                    sourceFilter={sourceFilter}
                    onSourceFilterChange={handleSourceFilterChange}
                    sourceCounts={stats?.countBySource}
                    footer={
                        totalPages > 1 && documents.length > 0 ? (
                            <HStack p={3} justify="space-between" bg="tableBg">
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
            </VStack>

            <UploadModal
                isOpen={uploadModal.isOpen}
                onClose={uploadModal.onClose}
                workspaceId={workspaceId}
                datasetId={datasetId}
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
