import React from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import { X } from "lucide-react";
import { formatFileSize, getFileTypeBadgeConfig } from "utils/documentFormatters";
import BoxIcon from "components/ui/BoxIcon";

interface SelectedFilesListProps {
    files: File[];
    onRemoveFile: (index: number) => void;
}

const SelectedFilesList: React.FC<SelectedFilesListProps> = ({ files, onRemoveFile }) => {
    if (files.length === 0) return null;

    return (
        <Box
            bg="surfacePrimary"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="borderDefault"
            borderRadius="12px"
            overflow="hidden"
        >
            {files.map((file, index) => {
                const badge = getFileTypeBadgeConfig(file.type);
                return (
                    <HStack
                        key={`${file.name}-${index}`}
                        px={3}
                        py={2.5}
                        bg="surfacePrimary"
                        borderBottom={index < files.length - 1 ? "1px solid" : "none"}
                        borderColor="borderDivider"
                        spacing={3}
                    >
                        <BoxIcon letters={badge.label} />
                        <Text fontSize="13px" color="textPrimary" flex={1} noOfLines={1}>
                            {file.name}
                        </Text>
                        <Text fontSize="11px" color="textMuted">
                            {formatFileSize(file.size)}
                        </Text>
                        <Box
                            as="button"
                            onClick={() => onRemoveFile(index)}
                            color="textMuted"
                            _hover={{ color: "textPrimary" }}
                        >
                            <X size={13} />
                        </Box>
                    </HStack>
                );
            })}
        </Box>
    );
};

export default SelectedFilesList;
