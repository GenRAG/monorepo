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
    useColorModeValue,
    useToken,
} from "@chakra-ui/react";
import { CheckCircle, FileWarning, Upload, File } from "lucide-react";
import { UploadProgress } from "pages/Agents/Documents/types";
import { formatFileSize } from "utils/documentFormatters";
import { useUploadDocumentMutation } from "services/document/document";
import { DocumentEntity, DocumentStatus } from "types/document/document";
import useThemedToast from "hooks/useThemedToast";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    agentId: string;
    targetFolderId: string | null;
    onUploadComplete: (documents?: DocumentEntity[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    onClose,
    workspaceId,
    agentId,
    onUploadComplete,
}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadFile, { isLoading: isUploading }] =
        useUploadDocumentMutation();
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const toast = useThemedToast();
    const uploadIconColorToken = useColorModeValue("green.500", "green.400");
    const [uploadIconColor] = useToken("colors", [uploadIconColorToken]);
    const bgIconContainer = useColorModeValue(
        "rgba(152, 255, 216, 0.38)",
        "rgba(152, 255, 216, 0.1)",
    );

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
                        title: `${file.name} n'est pas pris en charge`,
                        description:
                            "Veuillez téléverser des fichiers PDF, DOCX, TXT ou MD",
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

    const uploadOneFile = async (
        file: File,
        documentId: string,
    ): Promise<DocumentEntity> => {
        try {
            setUploadProgress((prev) =>
                prev.map((p) =>
                    p.documentId === documentId
                        ? { ...p, status: DocumentStatus.PROCESSING }
                        : p,
                ),
            );

            const uploaded = await uploadFile({
                workspaceId,
                agentId,
                file,
            }).unwrap();

            const document: DocumentEntity = {
                id: uploaded.id,
                agentId,
                name: file.name,
                mimeType: file.type,
                size: file.size,
                status: DocumentStatus.UPLOADED,
                createdAt: new Date(uploaded.createdAt ?? Date.now()),
                storageKey: uploaded.storageKey,
            };

            setUploadProgress((prev) =>
                prev.map((p) =>
                    p.documentId === documentId
                        ? {
                              ...p,
                              progress: 100,
                              status: DocumentStatus.UPLOADED,
                          }
                        : p,
                ),
            );

            return document;
        } catch (error) {
            setUploadProgress((prev) =>
                prev.map((p) =>
                    p.documentId === documentId
                        ? {
                              ...p,
                              status: DocumentStatus.FAILED,
                              error: "Échec du téléversement",
                          }
                        : p,
                ),
            );
            throw error;
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        if (!workspaceId || !agentId) {
            toast({
                title: "Paramètres de route manquants",
                description:
                    "L'identifiant du workspace ou de l'agent est manquant.",
                status: "error",
                duration: 4000,
            });
            return;
        }

        const initialProgress: UploadProgress[] = selectedFiles.map((file) => ({
            documentId: `doc-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            progress: 0,
            status: DocumentStatus.PROCESSING,
        }));
        setUploadProgress(initialProgress);

        try {
            const uploadedDocuments = await Promise.all(
                selectedFiles.map((file, index) =>
                    uploadOneFile(file, initialProgress[index].documentId),
                ),
            );

            onUploadComplete(uploadedDocuments);

            toast({
                title: "Téléversement réussi",
                description: `${selectedFiles.length} ${selectedFiles.length === 1 ? "document" : "documents"} téléversé(s) et en cours de traitement`,
                status: "success",
                duration: 3000,
            });

            setTimeout(() => {
                setSelectedFiles([]);
                setUploadProgress([]);
                onClose();
            }, 1500);
        } catch (_error) {
            toast({
                title: "Échec du téléversement",
                description: "Veuillez réessayer",
                status: "error",
                duration: 4000,
            });
            setIsDragging(false);
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
            <ModalContent bg="surfaceModal">
                <ModalHeader>Téléverser des documents</ModalHeader>
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
                                bg="surfacePrimary"
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
                                        bg={bgIconContainer}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Upload
                                            size={28}
                                            color={uploadIconColor}
                                        />
                                    </Box>

                                    <Text
                                        fontWeight="medium"
                                        color="textPrimary"
                                    >
                                        Déposez vos fichiers ici ou cliquez pour
                                        parcourir
                                    </Text>

                                    <Text fontSize="sm" color="textSecondary">
                                        PDF, DOCX, TXT, MD • 50MB max par
                                        fichier
                                    </Text>

                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() =>
                                            document
                                                .getElementById("file-input")
                                                ?.click()
                                        }
                                    >
                                        Sélectionner des fichiers
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
                                    color="textPrimary"
                                >
                                    {selectedFiles.length}{" "}
                                    {selectedFiles.length === 1
                                        ? "fichier"
                                        : "fichiers"}{" "}
                                    sélectionné(s)
                                </Text>
                                <List spacing={2}>
                                    {selectedFiles.map((file, index) => (
                                        <ListItem
                                            key={index}
                                            p={{ base: 2, md: 3 }}
                                            bg="surfacePrimary"
                                            borderColor="borderDefault"
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
                                                            color="textSecondary"
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
                                                    Supprimer
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
                                            {progress.status ===
                                                DocumentStatus.UPLOADED && (
                                                <CheckCircle color="green.500" />
                                            )}
                                            {progress.status ===
                                                DocumentStatus.FAILED && (
                                                <FileWarning color="red.500" />
                                            )}
                                        </HStack>

                                        {progress.status ===
                                            DocumentStatus.PROCESSING && (
                                            <HStack spacing={2}>
                                                <Progress
                                                    size="sm"
                                                    isIndeterminate
                                                    colorScheme="blue"
                                                    borderRadius="full"
                                                    flex={1}
                                                />
                                                <Text
                                                    fontSize="xs"
                                                    color="gray.500"
                                                >
                                                    Téléversement...
                                                </Text>
                                            </HStack>
                                        )}

                                        {progress.status ===
                                            DocumentStatus.UPLOADED && (
                                            <Progress
                                                value={progress.progress}
                                                size="sm"
                                                colorScheme="blue"
                                                borderRadius="full"
                                            />
                                        )}

                                        {progress.status ===
                                            DocumentStatus.UPLOADED && (
                                            <Text
                                                fontSize="xs"
                                                color="green.600"
                                            >
                                                Téléversement terminé
                                            </Text>
                                        )}
                                    </Box>
                                ))}
                            </VStack>
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
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpload}
                            isDisabled={
                                selectedFiles.length === 0 || isUploading
                            }
                            isLoading={isUploading}
                            loadingText="Téléversement..."
                        >
                            Téléverser{" "}
                            {selectedFiles.length > 0 &&
                                `(${selectedFiles.length})`}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
