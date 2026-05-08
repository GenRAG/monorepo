import React, { useRef } from "react";
import { Box, Icon, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Upload } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface DocumentDropZoneProps {
    isDragging: boolean;
    onFileSelect: (files: FileList | null) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

const DocumentDropZone: React.FC<DocumentDropZoneProps> = ({
    isDragging,
    onFileSelect,
    onDragOver,
    onDragLeave,
    onDrop,
}) => {
    const { colorMode } = useColorMode();
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <Box
            w="100%"
            border={`2px dashed ${isDragging ? currentDarkTheme.primary : colorMode === "dark" ? "grey" : "grey"}`}
            borderRadius="12px"
            p={8}
            bg={colorMode === "dark" ? "grey.700" : "grey.50"}
            textAlign="center"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            cursor="pointer"
            _hover={{
                borderColor: currentDarkTheme.primary,
                bg: colorMode === "dark" ? "grey.600" : "grey.100",
            }}
            transition="all 0.2s"
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.png"
                style={{ display: "none" }}
                onChange={(e) => onFileSelect(e.target.files)}
            />
            <VStack spacing={3}>
                <Icon
                    as={Upload}
                    boxSize={10}
                    color={currentDarkTheme.primary}
                />
                <Text
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "grey.900"}
                >
                    Add your internal regulations, collective agreement, or HR
                    PDF
                </Text>
                <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "grey.400" : "grey.600"}
                >
                    Drag & drop or click to select
                </Text>
            </VStack>
        </Box>
    );
};

export default DocumentDropZone;
