import React, { useState, useMemo } from "react";
import {
    VStack,
    HStack,
    Box,
    IconButton,
    useDisclosure,
    useColorMode,
    useToken,
    useBreakpointValue,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerBody,
} from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WorkspaceHeader from "components/Molecules/WorkspaceHeader";
import {
    DocumentStatus,
    Folder,
} from "pages/Workspace/Documents/document-type";
import { Document } from "pages/Workspace/Documents/document-type";
import { FolderSidebar } from "pages/Workspace/Documents/FolderSidebar";
import { DocumentList } from "pages/Workspace/Documents/DocumentList";
import { UploadModal } from "pages/Workspace/Documents/UploadModal";
import { PreviewDrawer } from "pages/Workspace/Documents/PreviewDrawer";

const mockFolders: Folder[] = [
    {
        id: "1",
        name: "Product Documentation",
        parentId: null,
        createdAt: new Date(),
    },
    { id: "2", name: "User Guides", parentId: "1", createdAt: new Date() },
    { id: "3", name: "Technical Specs", parentId: "1", createdAt: new Date() },
    {
        id: "4",
        name: "Marketing Materials",
        parentId: null,
        createdAt: new Date(),
    },
];

const mockDocuments: Document[] = [
    {
        id: "d1",
        name: "Getting Started Guide.pdf",
        type: "application/pdf",
        size: 2457600,
        folderId: "2",
        status: DocumentStatus.INDEXED,
        uploadedAt: new Date("2024-01-15"),
        s3Key: "docs/getting-started.pdf",
    },
    {
        id: "d2",
        name: "API Reference.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 1048576,
        folderId: "3",
        status: DocumentStatus.PROCESSING,
        uploadedAt: new Date("2024-01-20"),
        s3Key: "docs/api-ref.docx",
    },
    {
        id: "d3",
        name: "Architecture Overview.pdf",
        type: "application/pdf",
        size: 5242880,
        folderId: "3",
        status: DocumentStatus.INDEXED,
        uploadedAt: new Date("2024-01-18"),
        s3Key: "docs/architecture.pdf",
    },
];

export const DocumentWorkspace: React.FC = () => {
    const [folders, setFolders] = useState<Folder[]>(mockFolders);
    const [documents, setDocuments] = useState<Document[]>(mockDocuments);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
        null,
    );
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(
        null,
    );
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const uploadModal = useDisclosure();
    const previewDrawer = useDisclosure();
    const folderDrawer = useDisclosure();
    const { colorMode } = useColorMode();
    const isMobile = useBreakpointValue({ base: true, lg: false });

    const grey100 = useToken("colors", "grey.100");
    const grey700 = useToken("colors", "grey.700");
    const grey800 = useToken("colors", "grey.800");
    const green50 = useToken("colors", "green.50");

    const hoverBackgroundColor = useMemo(
        () => (colorMode === "dark" ? grey700 : green50),
        [colorMode, grey700, green50],
    );

    const sidebarBackgroundColor = useMemo(
        () => (colorMode === "dark" ? grey800 : "white"),
        [colorMode, grey800],
    );

    const sidebarBorderColor = useMemo(
        () => (colorMode === "dark" ? grey700 : grey100),
        [colorMode, grey700, grey100],
    );

    const filteredDocuments = selectedFolderId
        ? documents.filter((doc) => doc.folderId === selectedFolderId)
        : documents;

    const handleFolderCreate = (name: string, parentId: string | null) => {
        const newFolder: Folder = {
            id: `f-${Date.now()}`,
            name,
            parentId,
            createdAt: new Date(),
        };
        setFolders([...folders, newFolder]);
    };

    const handleFolderRename = (folderId: string, newName: string) => {
        setFolders(
            folders.map((f) =>
                f.id === folderId ? { ...f, name: newName } : f,
            ),
        );
    };

    const handleFolderDelete = (folderId: string) => {
        setFolders(
            folders.filter((f) => f.id !== folderId && f.parentId !== folderId),
        );
        if (selectedFolderId === folderId) {
            setSelectedFolderId(null);
        }
    };

    const handleDocumentDelete = (documentId: string) => {
        setDocuments(documents.filter((d) => d.id !== documentId));
    };

    const handleDocumentPreview = (document: Document) => {
        setSelectedDocument(document);
        setSelectedDocumentId(document.id);
        previewDrawer.onOpen();
    };

    const handleDocumentSelect = (documentId: string) => {
        const doc = documents.find((d) => d.id === documentId);
        if (doc) {
            handleDocumentPreview(doc);
        }
    };

    const handleUploadComplete = (uploadedDocs: Document[]) => {
        setDocuments([...documents, ...uploadedDocs]);
    };

    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
        >
            <WorkspaceHeader
                title="Documents"
                description="Manage your documents and upload new ones. Your assistant will use these documents to answer your questions."
            />

            <HStack flex={1} spacing={0} align="stretch" overflow="hidden">
                {!isMobile && (
                    <motion.div
                        animate={{
                            width: sidebarCollapsed ? "50px" : "280px",
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{
                            borderRight: `1px solid ${sidebarBorderColor}`,
                            backgroundColor: sidebarBackgroundColor,
                            overflow: "hidden",
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            height: "100%",
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {!sidebarCollapsed ? (
                                <motion.div
                                    key="sidebar-content"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ width: "100%", height: "100%" }}
                                >
                                    <FolderSidebar
                                        folders={folders}
                                        documents={documents}
                                        selectedFolderId={selectedFolderId}
                                        selectedDocumentId={selectedDocumentId}
                                        onFolderSelect={setSelectedFolderId}
                                        onDocumentSelect={handleDocumentSelect}
                                        onFolderCreate={handleFolderCreate}
                                        onFolderRename={handleFolderRename}
                                        onFolderDelete={handleFolderDelete}
                                        showDocuments={true}
                                        sidebarCollapsed={sidebarCollapsed}
                                        setSidebarCollapsed={
                                            setSidebarCollapsed
                                        }
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="sidebar-toggle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    whileHover={{
                                        backgroundColor: hoverBackgroundColor,
                                    }}
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: "100%",
                                        height: "100%",
                                        cursor: "pointer",
                                        backgroundColor: sidebarBackgroundColor,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSidebarCollapsed(!sidebarCollapsed);
                                    }}
                                >
                                    <IconButton
                                        aria-label="Toggle sidebar"
                                        icon={<ChevronRight />}
                                        size="xs"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSidebarCollapsed(
                                                !sidebarCollapsed,
                                            );
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
                <Box flex={1} overflow="hidden">
                    <DocumentList
                        documents={filteredDocuments}
                        selectedFolderId={selectedFolderId}
                        folders={folders}
                        onUploadClick={uploadModal.onOpen}
                        onDocumentPreview={handleDocumentPreview}
                        onDocumentDelete={handleDocumentDelete}
                        onOpenFolderDrawer={
                            isMobile ? folderDrawer.onOpen : undefined
                        }
                        isMobile={!!isMobile}
                    />
                </Box>
            </HStack>
            {isMobile && (
                <Drawer
                    isOpen={folderDrawer.isOpen}
                    placement="left"
                    onClose={folderDrawer.onClose}
                    size="full"
                >
                    <DrawerOverlay />
                    <DrawerContent maxW="320px">
                        <DrawerBody p={0} overflow="hidden">
                            <FolderSidebar
                                folders={folders}
                                documents={documents}
                                selectedFolderId={selectedFolderId}
                                selectedDocumentId={selectedDocumentId}
                                onFolderSelect={(id) => {
                                    setSelectedFolderId(id);
                                    folderDrawer.onClose();
                                }}
                                onDocumentSelect={(id) => {
                                    handleDocumentSelect(id);
                                    folderDrawer.onClose();
                                }}
                                onFolderCreate={handleFolderCreate}
                                onFolderRename={handleFolderRename}
                                onFolderDelete={handleFolderDelete}
                                showDocuments={true}
                                sidebarCollapsed={false}
                                setSidebarCollapsed={() => {}}
                                onCloseDrawer={folderDrawer.onClose}
                            />
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            )}
            <UploadModal
                isOpen={uploadModal.isOpen}
                onClose={uploadModal.onClose}
                targetFolderId={selectedFolderId}
                onUploadComplete={handleUploadComplete}
            />
            <PreviewDrawer
                isOpen={previewDrawer.isOpen}
                onClose={() => {
                    previewDrawer.onClose();
                    setSelectedDocumentId(null);
                }}
                document={selectedDocument}
            />
        </VStack>
    );
};
