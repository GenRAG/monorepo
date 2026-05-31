import React, { useRef } from "react";
import { Box, HStack, Icon, Text, VStack, useColorMode } from "@chakra-ui/react";
import { Upload } from "lucide-react";
import { currentDarkTheme } from "themeNew/foundations/themeConfig";

interface DocumentDropZoneProps {
    isDragging: boolean;
    onFileSelect?: (files: FileList | null) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    disabled?: boolean;
    maxFiles?: number;
    currentCount?: number;
}

const DocumentDropZone: React.FC<DocumentDropZoneProps> = ({
    isDragging,
    onFileSelect,
    onDragOver,
    onDragLeave,
    onDrop,
    disabled = false,
    maxFiles,
    currentCount,
}) => {
    const { colorMode } = useColorMode();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (!disabled) fileInputRef.current?.click();
    };

    return (
        <Box
            w="100%"
            border="1px dashed"
            borderColor={
                disabled
                    ? colorMode === "dark"
                        ? "grey.700"
                        : "grey.200"
                    : isDragging
                      ? currentDarkTheme.primary
                      : colorMode === "dark"
                        ? "grey.500"
                        : "grey.300"
            }
            borderRadius="12px"
            p={8}
            bg={
                disabled ? (colorMode === "dark" ? "grey.800" : "grey.50") : colorMode === "dark" ? "grey.900" : "white"
            }
            textAlign="center"
            onDragOver={disabled ? undefined : onDragOver}
            onDragLeave={disabled ? undefined : onDragLeave}
            onDrop={disabled ? undefined : onDrop}
            onClick={handleClick}
            cursor={disabled ? "not-allowed" : "pointer"}
            _hover={
                disabled
                    ? {}
                    : {
                          borderColor: currentDarkTheme.primary,
                          bg: colorMode === "dark" ? "green.800" : "green.50",
                      }
            }
            transition="all 0.2s"
            opacity={disabled ? 0.6 : 1}
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.png"
                style={{ display: "none" }}
                onChange={(e) => {
                    onFileSelect?.(e.target.files);
                    e.target.value = "";
                }}
                disabled={disabled}
            />
            <VStack spacing={3}>
                <Icon
                    as={Upload}
                    boxSize={10}
                    color={disabled ? (colorMode === "dark" ? "grey.600" : "grey.400") : currentDarkTheme.primary}
                />
                <Text
                    fontWeight="semibold"
                    color={
                        disabled
                            ? colorMode === "dark"
                                ? "grey.500"
                                : "grey.400"
                            : colorMode === "dark"
                              ? "white"
                              : "grey.900"
                    }
                >
                    {disabled
                        ? `Limite atteinte (${maxFiles} fichiers max)`
                        : "Ajoute tes documents internes, convention collective ou PDF RH"}
                </Text>
                {!disabled && (
                    <Text fontSize="sm" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                        Glisse & dépose ou clique pour sélectionner
                    </Text>
                )}
                {maxFiles !== undefined && currentCount !== undefined && !disabled && (
                    <HStack spacing={1}>
                        <Text fontSize="xs" color={colorMode === "dark" ? "grey.500" : "grey.400"}>
                            {currentCount}/{maxFiles} fichiers
                        </Text>
                    </HStack>
                )}
            </VStack>
        </Box>
    );
};

export default DocumentDropZone;
