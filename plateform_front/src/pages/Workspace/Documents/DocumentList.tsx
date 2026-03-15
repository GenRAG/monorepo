import React from "react";
import {
    VStack,
    HStack,
    Text,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    IconButton,
    Box,
    Tooltip,
    Spinner,
    Icon,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon, Upload, FileText, File, FolderTree } from "lucide-react";
import { Document, Folder } from "pages/Workspace/Documents/document-type";

interface DocumentListProps {
    documents: Document[];
    selectedFolderId: string | null;
    folders: Folder[];
    onUploadClick: () => void;
    onDocumentPreview: (document: Document) => void;
    onDocumentDelete: (documentId: string) => void;
    onOpenFolderDrawer?: () => void;
    isMobile?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documents,
    selectedFolderId,
    folders,
    onUploadClick,
    onDocumentPreview,
    onDocumentDelete,
    onOpenFolderDrawer,
    isMobile = false,
}) => {
    const selectedFolder = folders.find((f) => f.id === selectedFolderId);
    const { colorMode } = useColorMode();

    if (documents.length === 0) {
        return (
            <EmptyState
                folderId={selectedFolderId}
                folderName={selectedFolder?.name}
                onUploadClick={onUploadClick}
                onOpenFolderDrawer={onOpenFolderDrawer}
                isMobile={isMobile}
            />
        );
    }

    return (
        <VStack h="100%" align="stretch" spacing={0}>
            {isMobile ? (
                <Box
                    flex={1}
                    overflowY="auto"
                    css={{
                        "&::-webkit-scrollbar": { width: "6px" },
                        "&::-webkit-scrollbar-thumb": {
                            background: "#CBD5E0",
                            borderRadius: "3px",
                        },
                    }}
                >
                    <VStack spacing={3} align="stretch">
                        {documents.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onPreview={() => onDocumentPreview(doc)}
                                onDelete={() => onDocumentDelete(doc.id)}
                            />
                        ))}
                    </VStack>
                </Box>
            ) : (
                <Box
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "grey.700" : "grey.100"}
                    overflow="auto"
                    flex={1}
                >
                    <Table variant="simple" size="sm" minW="600px">
                        <Thead
                            position="sticky"
                            top={0}
                            padding={5}
                            bg={colorMode === "dark" ? "grey.800" : "white"}
                            zIndex={1}
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.800"
                            }
                        >
                            <Tr>
                                <Th>Name</Th>
                                <Th>Type</Th>
                                <Th>Size</Th>
                                <Th>Status</Th>
                                <Th>Uploaded</Th>
                                <Th width="100px">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {documents.map((doc) => (
                                <DocumentRow
                                    key={doc.id}
                                    document={doc}
                                    onPreview={() => onDocumentPreview(doc)}
                                    onDelete={() => onDocumentDelete(doc.id)}
                                />
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </VStack>
    );
};

interface DocumentCardProps {
    document: Document;
    onPreview: () => void;
    onDelete: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
    document,
    onPreview,
    onDelete,
}) => {
    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes("pdf")) return File;
        if (mimeType.includes("word") || mimeType.includes("document"))
            return FileText;
        return File;
    };

    const FileIconComponent = getFileIcon(document.type);
    const textColor = useColorModeValue("grey.800", "grey.100");
    const borderColor = useColorModeValue("grey.200", "grey.600");
    const bgColor = useColorModeValue("white", "grey.800");
    const hoverBg = useColorModeValue("grey.50", "grey.700");

    return (
        <Box
            p={4}
            borderRadius="12px"
            border="1px solid"
            borderColor={borderColor}
            bg={bgColor}
            cursor="pointer"
            onClick={onPreview}
            _hover={{ bg: hoverBg }}
            transition="background 0.2s"
        >
            <HStack justify="space-between" align="flex-start" spacing={3}>
                <HStack spacing={3} flex={1} minW={0}>
                    <Icon
                        as={FileIconComponent as React.ElementType}
                        color={textColor}
                        fontSize="20px"
                        flexShrink={0}
                    />
                    <VStack align="stretch" spacing={0} flex={1} minW={0}>
                        <Text
                            fontWeight="medium"
                            fontSize="sm"
                            color={textColor}
                            noOfLines={2}
                        >
                            {document.name}
                        </Text>
                        <HStack spacing={2} mt={1} flexWrap="wrap">
                            <Text fontSize="xs" color="grey.500">
                                {getFileTypeLabel(document.type)}
                            </Text>
                            <Text fontSize="xs" color="grey.500">
                                •
                            </Text>
                            <Text fontSize="xs" color="grey.500">
                                {formatFileSize(document.size)}
                            </Text>
                            <Text fontSize="xs" color="grey.500">
                                •
                            </Text>
                            <Text fontSize="xs" color="grey.500">
                                {formatDate(document.uploadedAt)}
                            </Text>
                        </HStack>
                        <Box mt={2}>
                            <StatusBadge status={document.status} />
                        </Box>
                    </VStack>
                </HStack>
                <Tooltip label="Delete document">
                    <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        flexShrink={0}
                    />
                </Tooltip>
            </HStack>
        </Box>
    );
};

interface DocumentRowProps {
    document: Document;
    onPreview: () => void;
    onDelete: () => void;
}

const DocumentRow: React.FC<DocumentRowProps> = ({
    document,
    onPreview,
    onDelete,
}) => {
    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes("pdf")) return File;
        if (mimeType.includes("word") || mimeType.includes("document"))
            return FileText;
        return File;
    };

    const FileIcon = getFileIcon(document.type);
    const textColor = useColorModeValue("grey.800", "grey.100");
    const hoverColor = useColorModeValue("grey.50", "grey.700");

    return (
        <Tr
            _hover={{ bg: hoverColor }}
            onClick={onPreview}
            style={{ cursor: "pointer" }}
        >
            <Td>
                <HStack spacing={3}>
                    <Icon
                        as={FileIcon as React.ElementType}
                        color={textColor}
                        fontSize="18px"
                    />
                    <Text fontWeight="medium" fontSize="sm" color={textColor}>
                        {document.name}
                    </Text>
                </HStack>
            </Td>
            <Td>
                <Text fontSize="sm" color={textColor}>
                    {getFileTypeLabel(document.type)}
                </Text>
            </Td>
            <Td>
                <Text fontSize="sm" color={textColor}>
                    {formatFileSize(document.size)}
                </Text>
            </Td>
            <Td>
                <StatusBadge status={document.status} />
            </Td>
            <Td>
                <Text fontSize="sm" color={textColor}>
                    {formatDate(document.uploadedAt)}
                </Text>
            </Td>
            <Td>
                <HStack spacing={1}>
                    <Tooltip label="Delete document">
                        <IconButton
                            aria-label="Delete"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        />
                    </Tooltip>
                </HStack>
            </Td>
        </Tr>
    );
};

interface StatusBadgeProps {
    status: Document["status"];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusConfig = {
        uploaded: { label: "Uploaded", colorScheme: "gray" },
        processing: { label: "Processing", colorScheme: "orange", icon: true },
        indexed: { label: "Ready", colorScheme: "green" },
        failed: { label: "Failed", colorScheme: "red" },
    };

    const textColor = useColorModeValue("grey.800", "grey.100");

    const config = statusConfig[status];

    return (
        <Badge colorScheme={config.colorScheme} fontSize="xs" px={2} py={1}>
            <HStack spacing={1}>
                {"icon" in config && config.icon && <Spinner size="xs" />}
                <Text fontSize="xs" color={textColor}>
                    {config.label}
                </Text>
            </HStack>
        </Badge>
    );
};

interface EmptyStateProps {
    folderId: string | null;
    folderName?: string;
    onUploadClick: () => void;
    onOpenFolderDrawer?: () => void;
    isMobile?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    folderId,
    folderName,
    onUploadClick,
    onOpenFolderDrawer,
    isMobile = false,
}) => {
    const { colorMode } = useColorMode();
    return (
        <VStack
            h="100%"
            justify="center"
            align="center"
            spacing={6}
            px={{ base: 4, md: 8 }}
            textAlign="center"
        >
            <VStack spacing={3}>
                {onOpenFolderDrawer && (
                    <IconButton
                        aria-label="Open folders"
                        icon={<FolderTree size={20} />}
                        size="sm"
                        variant="secondary"
                        onClick={onOpenFolderDrawer}
                    />
                )}
                <Box
                    w="60px"
                    h="60px"
                    borderRadius="full"
                    bg={"green.600"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Upload size={28} color="white" />
                </Box>
            </VStack>

            <VStack spacing={2}>
                <Text
                    fontSize={{ base: "lg", md: "xl" }}
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "grey.100" : "grey.800"}
                >
                    {folderId
                        ? `No documents in ${folderName}`
                        : "No documents yet"}
                </Text>
                <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "grey.400" : "grey.600"}
                    maxW={{ base: "100%", md: "400px" }}
                >
                    Upload your documents to get started. Your AI assistant will
                    use these documents to provide accurate, context-aware
                    answers to your questions.
                </Text>
            </VStack>

            <Button
                leftIcon={<Upload size={18} />}
                colorScheme="blue"
                variant="secondary"
                size={isMobile ? "md" : "lg"}
                onClick={onUploadClick}
            >
                Upload Your First Document
            </Button>

            <Box mt={4}>
                <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "grey.400" : "grey.600"}
                    mb={2}
                >
                    Supported formats
                </Text>
                <HStack spacing={2} flexWrap="wrap" justify="center">
                    <Badge colorScheme="gray">PDF</Badge>
                    <Badge colorScheme="gray">DOCX</Badge>
                    <Badge colorScheme="gray">TXT</Badge>
                    <Badge colorScheme="gray">MD</Badge>
                </HStack>
            </Box>
        </VStack>
    );
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

function getFileTypeLabel(mimeType: string): string {
    const typeMap: Record<string, string> = {
        "application/pdf": "PDF",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "Word",
        "application/msword": "Word",
        "text/plain": "Text",
        "text/markdown": "Markdown",
    };

    return typeMap[mimeType] || "Document";
}
