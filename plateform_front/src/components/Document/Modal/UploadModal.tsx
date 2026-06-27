import React, { useCallback, useMemo, useState } from "react";
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
} from "@chakra-ui/react";
import { Check } from "lucide-react";
import { ACCEPTED_TYPES, ACCEPTED_EXTENSIONS } from "hooks/useUploadDocuments";
import useThemedToast from "hooks/useThemedToast";
import useUploadDocuments from "hooks/useUploadDocuments";
import UploadDropzone from "./UploadDropzone";
import SelectedFilesList from "./SelectedFilesList";
import UploadProgressList from "./UploadProgressList";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    agentId: string;
    targetFolderId: string | null;
    onUploadComplete: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    onClose,
    workspaceId,
    agentId,
    onUploadComplete,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const toast = useThemedToast();

    const { selectedFiles, sources, isUploading, isDone, allDone, addFiles, removeSelectedFile, handleUpload, reset } =
        useUploadDocuments(workspaceId, agentId);

    const acceptedTypesString = useMemo(
        () => [...(ACCEPTED_TYPES as readonly string[]), ...ACCEPTED_EXTENSIONS].join(","),
        [],
    );

    const handleFileSelect = useCallback(
        (files: FileList | null) => {
            const { rejected } = addFiles(files);
            rejected.forEach((file) => {
                toast({
                    title: `${file.name} n'est pas pris en charge`,
                    description: "Veuillez téléverser des fichiers PDF, DOCX, TXT, MD ou HTML",
                    status: "warning",
                    duration: 3000,
                });
            });
        },
        [addFiles, toast],
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

    const onClickUpload = async () => {
        const { erroredFiles } = await handleUpload();
        if (erroredFiles.length > 0) {
            toast({
                title: "Erreur lors du téléversement",
                description: `${erroredFiles.join(", ")} n'${erroredFiles.length === 1 ? "a" : "ont"} pas pu être téléversé${erroredFiles.length === 1 ? "" : "s"}.`,
                status: "error",
                duration: 5000,
            });
        }
        onUploadComplete();
    };

    const handleClose = () => {
        if (isUploading) return;
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(2px)" />
            <ModalContent bg="surfacePrimary" borderRadius="16px">
                <ModalHeader fontSize="16px" fontWeight="600" color="textPrimary">
                    Téléverser des documents
                </ModalHeader>
                <ModalCloseButton isDisabled={isUploading} />

                <ModalBody pb={4}>
                    <VStack spacing={4} align="stretch">
                        {!isUploading && !isDone && (
                            <UploadDropzone
                                isDragging={isDragging}
                                acceptedTypesString={acceptedTypesString}
                                onFileSelect={handleFileSelect}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            />
                        )}

                        {!isDone && <SelectedFilesList files={selectedFiles} onRemoveFile={removeSelectedFile} />}

                        <UploadProgressList sources={sources} />
                    </VStack>
                </ModalBody>

                <ModalFooter pt={2}>
                    <HStack spacing={3} justify="flex-end">
                        <Button variant="ghost" onClick={handleClose} isDisabled={isUploading} fontSize="14px">
                            Fermer
                        </Button>

                        {!isDone && (
                            <Button
                                variant="superPrimary"
                                onClick={onClickUpload}
                                isDisabled={selectedFiles.length === 0}
                                isLoading={isUploading}
                                fontSize="14px"
                            >
                                Téléverser {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                            </Button>
                        )}

                        {isDone && (
                            <Button
                                variant="superPrimary"
                                onClick={handleClose}
                                isDisabled={!allDone}
                                isLoading={!allDone}
                                loadingText="En cours..."
                                leftIcon={allDone ? <Check size={14} /> : undefined}
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
