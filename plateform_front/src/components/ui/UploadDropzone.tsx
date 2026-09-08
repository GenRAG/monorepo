import React from "react";
import { Box, Card, HStack, Icon, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { AlertTriangle, CloudUpload } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";

interface UploadDropzoneProps {
    isDragging: boolean;
    acceptedTypesString: string;
    onFileSelect?: (files: FileList | null) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    title?: string;
    hint?: string;
    disabled?: boolean;
    disabledMessage?: string;
    maxFiles?: number;
    currentCount?: number;
}

const DEFAULT_TITLE = "Glissez vos fichiers ici";
const DEFAULT_HINT = "PDF, MD, TXT, DOCX, HTML - max 15 Mo / fichier";

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
    isDragging,
    acceptedTypesString,
    onFileSelect,
    onDrop,
    onDragOver,
    onDragLeave,
    title = DEFAULT_TITLE,
    hint = DEFAULT_HINT,
    disabled = false,
    disabledMessage,
    maxFiles,
    currentCount,
}) => {
    const bgWarning = useColorModeValue("orange.50", "orange.900");

    return (
        <Card
            as="label"
            size="none"
            borderWidth="1.5px"
            borderStyle="dashed"
            borderColor={disabled ? "borderDefault" : isDragging ? "green.400" : "borderDefault"}
            bg={disabled ? "surfaceSubtle" : isDragging ? "accentCardBg" : "surfaceHover"}
            borderRadius="14px"
            p={6}
            textAlign="center"
            transition="all 0.15s"
            cursor={disabled ? "not-allowed" : "pointer"}
            opacity={disabled ? 0.6 : 1}
            onDrop={disabled ? undefined : onDrop}
            onDragOver={disabled ? undefined : onDragOver}
            onDragLeave={disabled ? undefined : onDragLeave}
        >
            <VStack spacing={2}>
                <BoxIcon icon={CloudUpload} size="xl" color={disabled ? "textMuted" : "green.500"} />
                <Text fontWeight="600" fontSize="15px" color={disabled ? "textMuted" : "textPrimary"}>
                    {disabled && disabledMessage ? disabledMessage : title}
                </Text>
                {!disabled && (
                    <Text fontSize="13px" color="textMuted">
                        ou{" "}
                        <Box as="span" color="green.500" textDecoration="underline" fontWeight="500">
                            parcourez votre ordinateur
                        </Box>
                    </Text>
                )}
                <Text fontSize="12px" color="textMuted">
                    {hint}
                </Text>
                {maxFiles !== undefined && currentCount !== undefined && !disabled && (
                    <Text fontSize="xs" color="textLabel">
                        {currentCount}/{maxFiles} fichiers
                    </Text>
                )}
                {!disabled && (
                    <HStack
                        spacing={2}
                        px={3}
                        py={2}
                        mt={1}
                        bg={bgWarning}
                        borderWidth="1px"
                        borderStyle="solid"
                        borderColor="orange.200"
                        borderRadius="10px"
                        align="flex-start"
                    >
                        <Icon as={AlertTriangle} color="orange.400" boxSize={3.5} mt="1px" flexShrink={0} />
                        <Text fontSize="11px" color="textPrimary" textAlign="left">
                            Les PDFs scannés ou composés uniquement d&apos;images ne sont pas pris en charge.
                        </Text>
                    </HStack>
                )}
            </VStack>
            <input
                type="file"
                multiple
                accept={acceptedTypesString}
                style={{ display: "none" }}
                disabled={disabled}
                onChange={(e) => {
                    onFileSelect?.(e.target.files);
                    e.target.value = "";
                }}
            />
        </Card>
    );
};

export default UploadDropzone;
