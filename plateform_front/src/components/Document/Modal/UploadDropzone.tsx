import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import { CloudUpload } from "lucide-react";

interface UploadDropzoneProps {
    isDragging: boolean;
    acceptedTypesString: string;
    onFileSelect: (files: FileList | null) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
    isDragging,
    acceptedTypesString,
    onFileSelect,
    onDrop,
    onDragOver,
    onDragLeave,
}) => {
    return (
        <Box
            as="label"
            borderWidth="1.5px"
            borderStyle="dashed"
            borderColor={isDragging ? "green.400" : "borderDefault"}
            borderRadius="14px"
            bg={isDragging ? "accentCardBg" : "surfaceSubtle"}
            p={6}
            textAlign="center"
            transition="all 0.15s"
            cursor="pointer"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <VStack spacing={2}>
                <CloudUpload size={36} color={isDragging ? "#10B981" : "#6B7280"} />
                <Text fontWeight="600" fontSize="15px" color="textPrimary">
                    Glissez vos fichiers ici
                </Text>
                <Text fontSize="13px" color="textMuted">
                    ou{" "}
                    <Box as="span" color="green.500" textDecoration="underline" fontWeight="500">
                        parcourez votre ordinateur
                    </Box>
                </Text>
                <Text fontSize="12px" color="textMuted">
                    PDF, DOCX, TXT, MD · max 50 Mo / fichier
                </Text>
            </VStack>
            <input
                type="file"
                multiple
                accept={acceptedTypesString}
                style={{ display: "none" }}
                onChange={(e) => onFileSelect(e.target.files)}
            />
        </Box>
    );
};

export default UploadDropzone;
