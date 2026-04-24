import React from "react";
import {
    Badge,
    Box,
    Button,
    HStack,
    IconButton,
    Text,
    useColorModeValue,
    useToken,
    VStack,
} from "@chakra-ui/react";
import { FolderTree, Upload } from "lucide-react";

interface DocumentEmptyStateProps {
    folderId: string | null;
    folderName?: string;
    onUploadClick: () => void;
    onOpenFolderDrawer?: () => void;
    isMobile?: boolean;
}

export const DocumentEmptyState: React.FC<DocumentEmptyStateProps> = ({
    folderId,
    folderName,
    onUploadClick,
    onOpenFolderDrawer,
    isMobile = false,
}) => {
    const uploadIconColorToken = useColorModeValue("green.500", "green.400");
    const [uploadIconColor] = useToken("colors", [uploadIconColorToken]);

    return (
        <VStack
            h="100%"
            justify="center"
            align="center"
            spacing={3}
            w="100%"
            borderRadius="8px"
            border="1px solid"
            borderColor={useColorModeValue("grey.200", "grey.700")}
            px={{ base: 4, md: 8 }}
            textAlign="center"
            bg={useColorModeValue("white", "grey.975")}
        >
            <VStack spacing={1}>
                {onOpenFolderDrawer && (
                    <IconButton
                        aria-label="Open folders"
                        icon={<FolderTree size={20} />}
                        size="sm"
                        variant="secondary"
                        onClick={onOpenFolderDrawer}
                    />
                )}
                <Box
                    w="60px"
                    h="60px"
                    borderRadius="full"
                    bg={useColorModeValue(
                        "rgba(152, 255, 216, 0.38)",
                        "rgba(152, 255, 216, 0.1)",
                    )}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Upload size={28} color={uploadIconColor} />
                </Box>
            </VStack>

            <VStack spacing={2}>
                <Text
                    fontSize={{ base: "lg", md: "xl" }}
                    fontWeight="semibold"
                    color="textPrimary"
                >
                    {folderId
                        ? `No documents in ${folderName}`
                        : "No documents yet"}
                </Text>
                <Text
                    fontSize="sm"
                    color="textSecondary"
                    maxW={{ base: "100%", md: "400px" }}
                >
                    Téléversez vos documents pour commencer. Votre assistant IA
                    utilisera ces documents pour fournir des réponses précises
                    et contextualisées à vos questions.
                </Text>
            </VStack>

            <Button
                leftIcon={<Upload size={18} />}
                colorScheme="blue"
                variant="secondary"
                size={isMobile ? "md" : "lg"}
                onClick={onUploadClick}
            >
                Ajouter vos premiers documents
            </Button>

            <Box mt={4}>
                <Text fontSize="xs" color="textSecondary" mb={2}>
                    Formats pris en charge
                </Text>
                <HStack spacing={2} flexWrap="wrap" justify="center">
                    <Badge colorScheme="gray">PDF</Badge>
                    <Badge colorScheme="gray">DOCX</Badge>
                    <Badge colorScheme="gray">TXT</Badge>
                    <Badge colorScheme="gray">MD</Badge>
                </HStack>
            </Box>
        </VStack>
    );
};
