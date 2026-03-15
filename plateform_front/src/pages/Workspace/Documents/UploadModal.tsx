import React, { useState, useCallback, useMemo } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Text,
    Box,
    Progress,
    List,
    ListItem,
    useToast,
    useColorMode,
} from "@chakra-ui/react";
import { CheckCircle, FileWarning, Upload, File } from "lucide-react";
import {
    Document,
    DocumentStatus,
    UploadProgress,
} from "pages/Workspace/Documents/document-type";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetFolderId: string | null;
    onUploadComplete: (documents: Document[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    onClose,
    targetFolderId,
    onUploadComplete,
}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const { colorMode } = useColorMode();
    const toast = useToast();

    const acceptedTypes = useMemo(
        () => [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/plain",
            "text/markdown",
        ],
        [],
    );

    const handleFileSelect = useCallback(
        (files: FileList | null) => {
            if (!files) return;

            const validFiles = Array.from(files).filter((file) => {
                if (!acceptedTypes.includes(file.type)) {
                    toast({
                        title: `${file.name} is not supported`,
                        description:
                            "Please upload PDF, DOCX, TXT, or MD files",
                        status: "warning",
                        duration: 3000,
                    });
                    return false;
                }
                return true;
            });

            setSelectedFiles((prev) => [...prev, ...validFiles]);
        },
        [toast, acceptedTypes],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
        },
        [handleFileSelect],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const simulateUpload = async (file: File): Promise<Document> => {
        const documentId = `doc-${Date.now()}-${Math.random()}`;

        for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            setUploadProgress((prev) =>
                prev.map((p) =>
                    p.documentId === documentId ? { ...p, progress } : p,
                ),
            );
        }

        setUploadProgress((prev) =>
            prev.map((p) =>
                p.documentId === documentId
                    ? { ...p, status: DocumentStatus.PROCESSING }
                    : p,
            ),
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setUploadProgress((prev) =>
            prev.map((p) =>
                p.documentId === documentId
                    ? { ...p, status: DocumentStatus.UPLOADED }
                    : p,
            ),
        );

        return {
            id: documentId,
            name: file.name,
            type: file.type,
            size: file.size,
            folderId: targetFolderId,
            status: DocumentStatus.PROCESSING,
            uploadedAt: new Date(),
            s3Key: `documents/${documentId}`,
        };
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);

        const initialProgress: UploadProgress[] = selectedFiles.map((file) => ({
            documentId: `doc-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            progress: 0,
            status: DocumentStatus.UPLOADED,
        }));
        setUploadProgress(initialProgress);

        try {
            const uploadedDocuments = await Promise.all(
                selectedFiles.map((file) => simulateUpload(file)),
            );

            onUploadComplete(uploadedDocuments);

            toast({
                title: "Upload successful",
                description: `${selectedFiles.length} ${selectedFiles.length === 1 ? "document" : "documents"} uploaded and processing`,
                status: "success",
                duration: 3000,
            });

            setTimeout(() => {
                setSelectedFiles([]);
                setUploadProgress([]);
                setIsUploading(false);
                onClose();
            }, 1500);
        } catch (_error) {
            toast({
                title: "Upload failed",
                description: "Please try again",
                status: "error",
                duration: 4000,
            });
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            setSelectedFiles([]);
            setUploadProgress([]);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent bg={colorMode === "dark" ? "grey.900" : "white"}>
                <ModalHeader>Upload Documents</ModalHeader>
                <ModalCloseButton isDisabled={isUploading} />

                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        {!isUploading && (
                            <Box
                                border="2px dashed"
                                borderColor={
                                    isDragging ? "green.600" : "grey.200"
                                }
                                borderRadius="24px"
                                p={{ base: 6, md: 8 }}
                                textAlign="center"
                                bg={
                                    isDragging
                                        ? colorMode === "dark"
                                            ? "grey.800"
                                            : "white"
                                        : colorMode === "dark"
                                          ? "grey.800"
                                          : "white"
                                }
                                transition="all 0.2s"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <VStack spacing={3}>
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

                                    <Text
                                        fontWeight="medium"
                                        color={
                                            colorMode === "dark"
                                                ? "grey.100"
                                                : "grey.900"
                                        }
                                    >
                                        Drop files here or click to browse
                                    </Text>

                                    <Text
                                        fontSize="sm"
                                        color={
                                            colorMode === "dark"
                                                ? "grey.400"
                                                : "grey.600"
                                        }
                                    >
                                        PDF, DOCX, TXT, MD • Max 50MB per file
                                    </Text>

                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() =>
                                            document
                                                .getElementById("file-input")
                                                ?.click()
                                        }
                                    >
                                        Select Files
                                    </Button>

                                    <input
                                        id="file-input"
                                        type="file"
                                        multiple
                                        accept={acceptedTypes.join(",")}
                                        style={{ display: "none" }}
                                        onChange={(e) =>
                                            handleFileSelect(e.target.files)
                                        }
                                    />
                                </VStack>
                            </Box>
                        )}

                        {selectedFiles.length > 0 && !isUploading && (
                            <VStack align="stretch" spacing={2}>
                                <Text
                                    fontSize="sm"
                                    fontWeight="medium"
                                    color={
                                        colorMode === "dark"
                                            ? "grey.100"
                                            : "grey.900"
                                    }
                                >
                                    {selectedFiles.length}{" "}
                                    {selectedFiles.length === 1
                                        ? "file"
                                        : "files"}{" "}
                                    selected
                                </Text>
                                <List spacing={2}>
                                    {selectedFiles.map((file, index) => (
                                        <ListItem
                                            key={index}
                                            p={{ base: 2, md: 3 }}
                                            bg={
                                                colorMode === "dark"
                                                    ? "grey.800"
                                                    : "white"
                                            }
                                            borderColor={
                                                colorMode === "dark"
                                                    ? "grey.700"
                                                    : "grey.200"
                                            }
                                            borderWidth="1px"
                                            borderRadius="12px"
                                        >
                                            <HStack
                                                justify="space-between"
                                                flexWrap="wrap"
                                                gap={2}
                                            >
                                                <HStack spacing={3}>
                                                    <File color="grey" />
                                                    <VStack
                                                        align="start"
                                                        spacing={0}
                                                        minW={0}
                                                        flex={1}
                                                    >
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="medium"
                                                            noOfLines={2}
                                                        >
                                                            {file.name}
                                                        </Text>
                                                        <Text
                                                            fontSize="xs"
                                                            color={
                                                                colorMode ===
                                                                "dark"
                                                                    ? "grey.400"
                                                                    : "grey.600"
                                                            }
                                                        >
                                                            {formatFileSize(
                                                                file.size,
                                                            )}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    onClick={() =>
                                                        removeFile(index)
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </HStack>
                                        </ListItem>
                                    ))}
                                </List>
                            </VStack>
                        )}

                        {isUploading && (
                            <VStack align="stretch" spacing={3}>
                                {uploadProgress.map((progress) => (
                                    <Box key={progress.documentId}>
                                        <HStack justify="space-between" mb={2}>
                                            <HStack spacing={2}>
                                                <File
                                                    color="#718096"
                                                    size={16}
                                                />
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="medium"
                                                >
                                                    {progress.fileName}
                                                </Text>
                                            </HStack>
                                            {progress.status === DocumentStatus.UPLOADED && (
                                                <CheckCircle color="green.500" />
                                            )}
                                            {progress.status === DocumentStatus.FAILED && (
                                                <FileWarning color="red.500" />
                                            )}
                                        </HStack>

                                        {progress.status === DocumentStatus.UPLOADED && (
                                            <Progress
                                                value={progress.progress}
                                                size="sm"
                                                colorScheme="blue"
                                                borderRadius="full"
                                            />
                                        )}

                                        {progress.status === "processing" && (
                                            <HStack spacing={2}>
                                                <Progress
                                                    size="sm"
                                                    isIndeterminate
                                                    colorScheme="yellow"
                                                    borderRadius="full"
                                                    flex={1}
                                                />
                                                <Text
                                                    fontSize="xs"
                                                    color="gray.500"
                                                >
                                                    Processing...
                                                </Text>
                                            </HStack>
                                        )}

                                        {progress.status === DocumentStatus.UPLOADED && (
                                            <Text
                                                fontSize="xs"
                                                color="green.600"
                                            >
                                                Upload complete
                                            </Text>
                                        )}
                                    </Box>
                                ))}
                            </VStack>
                        )}
                        {targetFolderId && !isUploading && (
                            <Text
                                fontSize="sm"
                                color={
                                    colorMode === "dark"
                                        ? "grey.400"
                                        : "grey.600"
                                }
                            >
                                Documents will be uploaded to the selected
                                folder
                            </Text>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter flexDir={{ base: "column-reverse", sm: "row" }}>
                    <HStack
                        spacing={3}
                        w={{ base: "100%", sm: "auto" }}
                        justify={{ base: "stretch", sm: "flex-end" }}
                    >
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            isDisabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpload}
                            isDisabled={
                                selectedFiles.length === 0 || isUploading
                            }
                            isLoading={isUploading}
                            loadingText="Uploading..."
                        >
                            Upload{" "}
                            {selectedFiles.length > 0 &&
                                `(${selectedFiles.length})`}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}
