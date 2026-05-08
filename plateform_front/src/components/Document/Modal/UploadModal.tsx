import React, { useState, useCallback, useMemo, useRef } from "react";
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
    Spinner,
    useColorModeValue,
} from "@chakra-ui/react";
import { Check, CheckCircle, CloudUpload, X } from "lucide-react";
import { UploadProgress } from "pages/Agents/Documents/types";
import {
    formatFileSize,
    getFileTypeBadgeConfig,
} from "utils/documentFormatters";
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
    const [isDone, setIsDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const toast = useThemedToast();

    const borderColor = useColorModeValue("grey.200", "grey.700");
    const dragBorderColor = useColorModeValue("green.400", "green.500");
    const dropBg = useColorModeValue("grey.50", "grey.900");
    const dragBg = useColorModeValue("green.50", "rgba(6,78,59,0.15)");
    const mutedColor = useColorModeValue("grey.500", "grey.400");
    const textColor = useColorModeValue("grey.800", "grey.100");
    const fileBg = useColorModeValue("grey.50", "grey.900");
    const fileItemBg = useColorModeValue("white", "grey.850");
    const fileItemBorder = useColorModeValue("grey.150", "grey.750");
    const trackColor = useColorModeValue("grey.200", "grey.700");

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
            const valid = Array.from(files).filter((file) => {
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
            setSelectedFiles((prev) => [...prev, ...valid]);
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

            return {
                id: uploaded.id,
                agentId,
                name: file.name,
                mimeType: file.type,
                size: file.size,
                status: DocumentStatus.UPLOADED,
                createdAt: new Date(uploaded.createdAt ?? Date.now()),
                storageKey: uploaded.storageKey,
            };
        } catch {
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
            throw new Error("Upload failed");
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;
        if (!workspaceId || !agentId) return;

        const initial: UploadProgress[] = selectedFiles.map((file) => ({
            documentId: `doc-${Date.now()}-${Math.random()}`,
            fileName: file.name,
            progress: 0,
            status: DocumentStatus.PROCESSING,
        }));
        setUploadProgress(initial);
        setSelectedFiles([]);

        try {
            const docs = await Promise.all(
                selectedFiles.map((file, i) =>
                    uploadOneFile(file, initial[i].documentId),
                ),
            );
            onUploadComplete(docs);
            setIsDone(true);
        } catch {
            toast({
                title: "Échec du téléversement",
                description: "Veuillez réessayer",
                status: "error",
                duration: 4000,
            });
        }
    };

    const handleClose = () => {
        if (isUploading) return;
        setSelectedFiles([]);
        setUploadProgress([]);
        setIsDone(false);
        onClose();
    };

    const allDone =
        uploadProgress.length > 0 &&
        uploadProgress.every(
            (p) =>
                p.status === DocumentStatus.UPLOADED ||
                p.status === DocumentStatus.FAILED,
        );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(2px)" />
            <ModalContent
                bg={useColorModeValue("white", "grey.950")}
                borderRadius="16px"
            >
                <ModalHeader fontSize="16px" fontWeight="600" color={textColor}>
                    Téléverser des documents
                </ModalHeader>
                <ModalCloseButton isDisabled={isUploading} />

                <ModalBody pb={4}>
                    <VStack spacing={4} align="stretch">
                        {/* Drop zone */}
                        {!isUploading && !isDone && (
                            <Box
                                border="2px dashed"
                                borderColor={
                                    isDragging ? dragBorderColor : borderColor
                                }
                                borderRadius="14px"
                                bg={isDragging ? dragBg : dropBg}
                                py={10}
                                px={6}
                                textAlign="center"
                                transition="all 0.15s"
                                cursor="pointer"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => inputRef.current?.click()}
                            >
                                <VStack spacing={2}>
                                    <CloudUpload
                                        size={36}
                                        color={
                                            isDragging ? "#10B981" : "#6B7280"
                                        }
                                    />
                                    <Text
                                        fontWeight="600"
                                        fontSize="15px"
                                        color={textColor}
                                    >
                                        Glissez vos fichiers ici
                                    </Text>
                                    <Text fontSize="13px" color={mutedColor}>
                                        ou{" "}
                                        <Box
                                            as="span"
                                            color="green.500"
                                            textDecoration="underline"
                                            fontWeight="500"
                                        >
                                            parcourez votre ordinateur
                                        </Box>
                                    </Text>
                                    <Text fontSize="12px" color={mutedColor}>
                                        PDF, DOCX, TXT, MD · max 50 Mo / fichier
                                    </Text>
                                </VStack>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    multiple
                                    accept={acceptedTypes.join(",")}
                                    style={{ display: "none" }}
                                    onChange={(e) =>
                                        handleFileSelect(e.target.files)
                                    }
                                />
                            </Box>
                        )}

                        {/* Selected files (pre-upload) */}
                        {selectedFiles.length > 0 && !isUploading && (
                            <Box
                                bg={fileBg}
                                border="1px solid"
                                borderColor={borderColor}
                                borderRadius="12px"
                                overflow="hidden"
                            >
                                {selectedFiles.map((file, index) => {
                                    const badge = getFileTypeBadgeConfig(
                                        file.type,
                                    );
                                    return (
                                        <HStack
                                            key={index}
                                            px={3}
                                            py={2.5}
                                            bg={fileItemBg}
                                            borderBottom={
                                                index < selectedFiles.length - 1
                                                    ? "1px solid"
                                                    : "none"
                                            }
                                            borderColor={fileItemBorder}
                                            spacing={3}
                                        >
                                            <Box
                                                bg={badge.bg}
                                                color={badge.color}
                                                fontSize="9px"
                                                fontWeight="700"
                                                px="5px"
                                                py="3px"
                                                borderRadius="4px"
                                                flexShrink={0}
                                            >
                                                {badge.label}
                                            </Box>
                                            <Text
                                                fontSize="13px"
                                                color={textColor}
                                                flex={1}
                                                noOfLines={1}
                                            >
                                                {file.name}
                                            </Text>
                                            <Text
                                                fontSize="11px"
                                                color={mutedColor}
                                            >
                                                {formatFileSize(file.size)}
                                            </Text>
                                            <Box
                                                as="button"
                                                onClick={() =>
                                                    setSelectedFiles((prev) =>
                                                        prev.filter(
                                                            (_, i) =>
                                                                i !== index,
                                                        ),
                                                    )
                                                }
                                                color={mutedColor}
                                                _hover={{ color: textColor }}
                                            >
                                                <X size={13} />
                                            </Box>
                                        </HStack>
                                    );
                                })}
                            </Box>
                        )}

                        {uploadProgress.length > 0 && (
                            <VStack align="stretch" spacing={1}>
                                {uploadProgress.map((p) => {
                                    const done =
                                        p.status === DocumentStatus.UPLOADED;
                                    const failed =
                                        p.status === DocumentStatus.FAILED;
                                    const pct = done ? 100 : p.progress;

                                    return (
                                        <HStack
                                            key={p.documentId}
                                            px={1}
                                            py={2}
                                            spacing={3}
                                            align="center"
                                        >
                                            <Box
                                                flexShrink={0}
                                                w="16px"
                                                h="16px"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                {done ? (
                                                    <CheckCircle
                                                        size={16}
                                                        color="#10B981"
                                                    />
                                                ) : failed ? (
                                                    <X
                                                        size={16}
                                                        color="#EF4444"
                                                    />
                                                ) : (
                                                    <Spinner
                                                        size="xs"
                                                        color="grey.400"
                                                    />
                                                )}
                                            </Box>
                                            <Text
                                                fontSize="13px"
                                                color={textColor}
                                                flex={1}
                                                noOfLines={1}
                                            >
                                                {p.fileName}
                                            </Text>
                                            <Box flex={2} position="relative">
                                                <Box
                                                    h="4px"
                                                    borderRadius="full"
                                                    bg={trackColor}
                                                    overflow="hidden"
                                                >
                                                    <Box
                                                        h="100%"
                                                        w={`${pct}%`}
                                                        bg={
                                                            failed
                                                                ? "red.500"
                                                                : "green.500"
                                                        }
                                                        transition="width 0.3s ease"
                                                        borderRadius="full"
                                                    />
                                                </Box>
                                            </Box>
                                            <Text
                                                fontSize="12px"
                                                color={
                                                    done
                                                        ? "green.500"
                                                        : failed
                                                          ? "red.400"
                                                          : mutedColor
                                                }
                                                fontWeight="500"
                                                w="36px"
                                                textAlign="right"
                                            >
                                                {pct}%
                                            </Text>
                                        </HStack>
                                    );
                                })}
                            </VStack>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter pt={2}>
                    <HStack spacing={3} justify="flex-end">
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            isDisabled={isUploading}
                            fontSize="14px"
                        >
                            Fermer
                        </Button>

                        {!isUploading && !isDone && (
                            <Button
                                variant="primary"
                                onClick={handleUpload}
                                isDisabled={selectedFiles.length === 0}
                                fontSize="14px"
                            >
                                Téléverser{" "}
                                {selectedFiles.length > 0 &&
                                    `(${selectedFiles.length})`}
                            </Button>
                        )}

                        {(isUploading || isDone) && (
                            <Button
                                variant="primary"
                                onClick={handleClose}
                                isDisabled={!allDone}
                                isLoading={isUploading && !allDone}
                                loadingText="En cours..."
                                leftIcon={
                                    allDone ? <Check size={14} /> : undefined
                                }
                                fontSize="14px"
                            >
                                Terminer
                            </Button>
                        )}
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
