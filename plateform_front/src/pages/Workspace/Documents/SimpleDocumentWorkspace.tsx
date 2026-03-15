import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    HStack,
    IconButton,
    SimpleGrid,
    Text,
    VStack,
    useColorModeValue,
    useDisclosure,
    useColorMode,
} from "@chakra-ui/react";
import { Chart, registerables } from "chart.js";
import WorkspaceHeader from "components/Molecules/WorkspaceHeader";
import { DocumentList } from "pages/Workspace/Documents/DocumentList";
import { PreviewDrawer } from "pages/Workspace/Documents/PreviewDrawer";
import { UploadModal } from "pages/Workspace/Documents/UploadModal";
import {
    Document,
    DocumentStatus,
} from "pages/Workspace/Documents/document-type";
import { Upload, ArrowUpDown, MoveLeft, MoveRight } from "lucide-react";
import { StorageOverviewPanel } from "pages/Workspace/Documents/DocumentsChart";

Chart.register(...registerables);

const SIMPLE_MOCK_DOCUMENTS: Document[] = [
    {
        id: "simple-d1",
        name: "Company Overview.pdf",
        type: "application/pdf",
        size: 1824760000,
        folderId: null,
        status: DocumentStatus.INDEXED,
        uploadedAt: new Date("2026-03-05"),
        s3Key: "documents/company-overview.pdf",
    },
    {
        id: "simple-d2",
        name: "FAQ Product.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 882476,
        folderId: null,
        status: DocumentStatus.PROCESSING,
        uploadedAt: new Date("2026-03-09"),
        s3Key: "documents/faq-product.docx",
    },
    {
        id: "simple-d3",
        name: "Pricing Notes.md",
        type: "text/markdown",
        size: 18476,
        folderId: null,
        status: DocumentStatus.UPLOADED,
        uploadedAt: new Date("2026-03-11"),
        s3Key: "documents/pricing-notes.md",
    },
    {
        id: "simple-d3",
        name: "Pricing Notes.md",
        type: "text/markdown",
        size: 18476,
        folderId: null,
        status: DocumentStatus.UPLOADED,
        uploadedAt: new Date("2026-03-11"),
        s3Key: "documents/pricing-notes.md",
    },
    {
        id: "simple-d3",
        name: "Pricing Notes.md",
        type: "text/markdown",
        size: 18476,
        folderId: null,
        status: DocumentStatus.UPLOADED,
        uploadedAt: new Date("2026-03-11"),
        s3Key: "documents/pricing-notes.md",
    },
];

export const StatCard: React.FC<{
    label: string;
    value: number | string;
    accent?: boolean;
}> = ({ label, value, accent }) => {
    const bg = useColorModeValue("white", "grey.800");
    const border = useColorModeValue("grey.100", "grey.700");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const valueColor = useColorModeValue("grey.900", "white");

    return (
        <Box
            bg={bg}
            border="1px solid"
            borderColor={border}
            borderRadius="12px"
            px={5}
            py={4}
        >
            <Text
                fontSize="xs"
                color={labelColor}
                mb={1}
                textTransform="uppercase"
                letterSpacing="0.06em"
            >
                {label}
            </Text>
            <Text
                fontSize="2xl"
                fontWeight="semibold"
                color={accent ? "green.400" : valueColor}
                lineHeight="1.2"
            >
                {value}
            </Text>
        </Box>
    );
};

export const SimpleDocumentWorkspace: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>(
        SIMPLE_MOCK_DOCUMENTS,
    );
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(
        null,
    );
    const [activeTab, setActiveTab] = useState<string>("all");

    const uploadModal = useDisclosure();
    const previewDrawer = useDisclosure();
    const { colorMode } = useColorMode();

    const bg = useColorModeValue("white", "grey.900");
    const panelBg = useColorModeValue("white", "grey.800");
    const panelBorder = useColorModeValue("grey.100", "grey.700");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const textPrimary = useColorModeValue("grey.900", "white");

    const indexedCount = useMemo(
        () =>
            documents.filter((d) => d.status === DocumentStatus.INDEXED).length,
        [documents],
    );
    const processingCount = useMemo(
        () =>
            documents.filter((d) => d.status === DocumentStatus.PROCESSING)
                .length,
        [documents],
    );
    const totalSize = useMemo(
        () => documents.reduce((acc, d) => acc + d.size, 0),
        [documents],
    );

    const filteredDocuments = useMemo(
        () =>
            activeTab === "all"
                ? documents
                : documents.filter((d) => d.status === activeTab),
        [documents, activeTab],
    );

    const tabCounts: Record<string, number> = useMemo(
        () => ({
            all: documents.length,
            [DocumentStatus.UPLOADED]: documents.filter(
                (d) => d.status === DocumentStatus.UPLOADED,
            ).length,
            [DocumentStatus.PROCESSING]: processingCount,
            [DocumentStatus.INDEXED]: indexedCount,
        }),
        [documents, indexedCount, processingCount],
    );

    const handleDocumentDelete = (id: string) => {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (selectedDocument?.id === id) {
            setSelectedDocument(null);
            previewDrawer.onClose();
        }
    };

    const handleDocumentPreview = (doc: Document) => {
        setSelectedDocument(doc);
        previewDrawer.onOpen();
    };

    const handleUploadComplete = (uploadedDocs: Document[]) => {
        setDocuments((prev) => [
            ...uploadedDocs.map((doc) => ({ ...doc, folderId: null })),
            ...prev,
        ]);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(0)} KB`;
        return `${(bytes / 1_000_000).toFixed(1)} MB`;
    };

    return (
        <VStack
            w="100%"
            h="100vh"
            align="stretch"
            spacing={0}
            overflow="hidden"
            bg={bg}
        >
            <WorkspaceHeader
                title="Documents"
                description="Upload documents directly to your agent, with no folders and no filesystem complexity."
            />

            <VStack
                align="stretch"
                spacing={5}
                px={{ base: 4, md: 6 }}
                py={{ base: 4, md: 5 }}
                overflow="auto"
                flex={1}
            >
                <SimpleGrid w="100%" spacing={4}>
                    <Box
                        bg={panelBg}
                        w="100%"
                        border="1px solid"
                        borderColor={panelBorder}
                        borderRadius="14px"
                        p={5}
                        display="flex"
                        flexDirection="column"
                    >
                        <HStack
                            w="100%"
                            justify="space-between"
                            mb={4}
                            flexShrink={0}
                        >
                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color={textPrimary}
                            >
                                Storage Overview
                            </Text>
                            <IconButton
                                aria-label="sort"
                                icon={<ArrowUpDown size={14} />}
                                size="xs"
                                variant="ghost"
                                color={labelColor}
                            />
                        </HStack>
                        <Box flex={1} minH={0}>
                            <StorageOverviewPanel
                                documents={documents}
                                colorMode={colorMode}
                            />
                        </Box>
                    </Box>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                    <StatCard label="Total" value={documents.length} />
                    <StatCard label="Indexed" value={indexedCount} accent />
                    <StatCard label="Processing" value={processingCount} />
                    <StatCard
                        label="Total size"
                        value={formatSize(totalSize)}
                    />
                </SimpleGrid>
                <HStack justify="flex-end" spacing={3}>
                    <Button
                        leftIcon={<Upload size={15} />}
                        onClick={uploadModal.onOpen}
                        size="sm"
                        variant="primary"
                    >
                        Upload Documents
                    </Button>
                </HStack>

                <DocumentList
                    documents={filteredDocuments}
                    selectedFolderId={null}
                    folders={[]}
                    onUploadClick={uploadModal.onOpen}
                    onDocumentPreview={handleDocumentPreview}
                    onDocumentDelete={handleDocumentDelete}
                    isMobile={false}
                />

                <HStack
                    bg={colorMode === "dark" ? "grey.800" : "white"}
                    p={3}
                    borderRadius="8px"
                    justify="space-between"
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "grey.700" : "grey.100"}
                >
                    <Text>
                        Page {1} of {Math.ceil(filteredDocuments.length / 10)}
                    </Text>
                    <HStack>
                        <IconButton
                            aria-label="left"
                            as={MoveLeft}
                            size="sm"
                            variant="outline"
                            p={2}
                        />
                        <IconButton
                            aria-label="left"
                            as={MoveRight}
                            size="sm"
                            variant="outline"
                            p={2}
                        />
                    </HStack>
                </HStack>
            </VStack>

            <UploadModal
                isOpen={uploadModal.isOpen}
                onClose={uploadModal.onClose}
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
