import React from "react";
import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AlertTriangle, CloudUpload } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";
import { useColorModeValue } from "@chakra-ui/react";

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
    const bgWarning = useColorModeValue("orange.50", "orange.900");
    const textColor = useColorModeValue("grey.900", "grey.50");

    return (
        <Box
            as="label"
            borderWidth="1.5px"
            borderStyle="dashed"
            borderColor={isDragging ? "green.400" : "borderDefault"}
            borderRadius="14px"
            bg={isDragging ? "accentCardBg" : "surfaceHover"}
            p={6}
            textAlign="center"
            transition="all 0.15s"
            cursor="pointer"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <VStack spacing={2}>
                <BoxIcon icon={CloudUpload} color="green.500" />
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
                    PDF, MD, TXT, DOCX, HTML - max 15 Mo / fichier
                </Text>
                <HStack
                    spacing={2}
                    px={3}
                    py={2}
                    bg={bgWarning}
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor="orange.200"
                    borderRadius="10px"
                    align="flex-start"
                >
                    <Icon as={AlertTriangle} color="orange.400" boxSize={3.5} mt="1px" flexShrink={0} />
                    <Text fontSize="11px" color={textColor} textAlign="left">
                        Les PDFs scannés ou composés uniquement d&apos;images ne sont pas pris en charge.
                    </Text>
                </HStack>
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
