import React, { useState } from "react";
import {
    Box,
    Button,
    HStack,
    IconButton,
    Text,
    VStack,
    useColorMode,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Chart, registerables } from "chart.js";
import WorkspaceHeader from "components/System/Molecules/WorkspaceHeader";
import { DocumentList } from "components/Document/DocumentList";
import { PreviewDrawer } from "components/Document/Drawer/PreviewDrawer";
import { UploadModal } from "components/Document/Modal/UploadModal";
import { DocumentPageHeader } from "components/Document/DocumentPageHeader";
import { Upload, MoveLeft, MoveRight } from "lucide-react";
import {
    useDeleteDocumentMutation,
    useGetAgentDocumentsQuery,
    useLazyGetDocumentUrlQuery,
} from "services/document/document";
import { useParams } from "react-router-dom";
import { DocumentEntity } from "types/document/document";
import { useAppResponsive } from "hooks/useAppResponsive";

const GRID_SIZE = 28;
const PAGE_SIZE = 5;

const GLOW_DOTS = [
    { top: "14%", left: "20%", delay: 0, duration: 3 },
    { top: "32%", left: "57%", delay: 1.2, duration: 4 },
    { top: "46%", left: "18%", delay: 0.6, duration: 3.5 },
    { top: "25%", left: "43%", delay: 2, duration: 4.5 },
    { top: "58%", left: "67%", delay: 0.4, duration: 3.8 },
    { top: "39%", left: "32%", delay: 1.8, duration: 5 },
    { top: "11%", left: "50%", delay: 1, duration: 3.2 },
    { top: "62%", left: "39%", delay: 2.4, duration: 4.2 },
    { top: "72%", left: "22%", delay: 0.8, duration: 3.6 },
    { top: "54%", left: "60%", delay: 1.5, duration: 4.8 },
];

Chart.register(...registerables);

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

    const [selectedDocument, setSelectedDocument] =
        useState<DocumentEntity | null>(null);

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
        // Si on supprime le dernier doc de la page, on recule d'une page
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
        // RTK Query invalide automatiquement le cache et re-fetche la page 1
    };

    const isMobile = useAppResponsive({ base: true, lg: false }) ?? false;

    const lineColor =
        colorMode === "dark"
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(0, 0, 0, 0.03)";
    const buttonType = useColorModeValue("primary", "superPrimary");

    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
            position="relative"
            sx={{
                backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                backgroundPosition: "0 0",
                contain: "paint",
            }}
        >
            {GLOW_DOTS.map((dot, i) => (
                <Box
                    key={i}
                    position="absolute"
                    top={`${dot.top}px`}
                    left={`${dot.left}px`}
                    pointerEvents="none"
                    zIndex={0}
                    transform="translate(-50%, -50%)"
                >
                    <motion.div
                        animate={{
                            opacity: [0.06, 0.22, 0.06],
                            boxShadow: [
                                "0 0 2px 1px rgba(18,185,140,0.06)",
                                "0 0 5px 2px rgba(18,185,140,0.18)",
                                "0 0 2px 1px rgba(18,185,140,0.06)",
                            ],
                        }}
                        transition={{
                            duration: dot.duration,
                            delay: dot.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        style={{
                            width: "2px",
                            height: "2px",
                            borderRadius: "9999px",
                            backgroundColor: "#12B98C",
                        }}
                    />
                </Box>
            ))}
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
                <DocumentPageHeader workspaceId={workspaceId!} agentId={agentId!} />
                {documents.length !== 0 && (
                    <Button
                        leftIcon={<Upload size={15} />}
                        onClick={uploadModal.onOpen}
                        size="sm"
                        w={{ base: "100%", md: "auto" }}
                        alignSelf={{ base: "stretch", md: "flex-end" }}
                        variant={buttonType}
                    >
                        Téléverser des documents
                    </Button>
                )}

                <DocumentList
                    documents={documents}
                    selectedFolderId={null}
                    onUploadClick={uploadModal.onOpen}
                    onDocumentPreview={handleDocumentPreview}
                    onDocumentDelete={handleDocumentDelete}
                    onDocumentDownload={handleDocumentDownload}
                    isMobile={isMobile}
                />

                {totalPages > 0 && (
                    <HStack
                        bg={colorMode === "dark" ? "grey.950" : "white"}
                        p={3}
                        borderRadius="8px"
                        justify="space-between"
                        border="1px solid"
                        borderColor={
                            colorMode === "dark" ? "grey.700" : "grey.100"
                        }
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
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                isDisabled={currentPage === 1}
                            />
                            <IconButton
                                aria-label="Page suivante"
                                icon={<MoveRight size={16} />}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
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
