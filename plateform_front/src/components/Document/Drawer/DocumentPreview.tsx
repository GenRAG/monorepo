import React from "react";
import { VStack, Text, Box } from "@chakra-ui/react";
import { File } from "lucide-react";

interface DocumentPreviewProps {
    document: {
        name: string;
    };
    previewUrl: string | null;
    isLoading: boolean;
    isError: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, previewUrl, isLoading, isError }) => {
    return (
        <VStack align="stretch" spacing={4}>
            <Text
                fontWeight="medium"
                fontSize="11px"
                color="textPrimary"
                letterSpacing="0.08em"
                textTransform="uppercase"
            >
                Aperçu du document
            </Text>

            <Box
                h={{ base: "250px", md: "400px" }}
                bg="surfacePrimary"
                borderRadius="12px"
                border="1px solid"
                borderColor="borderDefault"
                overflow="hidden"
                p={3}
            >
                {isLoading && (
                    <VStack h="100%" justify="center" align="center" spacing={3}>
                        <Text fontSize="sm" color="textMuted">
                            Chargement de l&apos;aperçu...
                        </Text>
                    </VStack>
                )}

                {!isLoading && previewUrl && (
                    <Box
                        as="iframe"
                        src={previewUrl}
                        title={document.name}
                        w="100%"
                        h="100%"
                        border="0"
                        borderRadius="8px"
                    />
                )}

                {!isLoading && (!previewUrl || isError) && (
                    <VStack h="100%" justify="center" align="center" spacing={3}>
                        <Box as={File} fontSize="48px" color="gray.400" />
                        <Text fontSize="sm" color="textMuted">
                            Aperçu non disponible
                        </Text>
                        <Text fontSize="xs" color="textMuted">
                            Téléchargez le fichier pour consulter son contenu
                        </Text>
                    </VStack>
                )}
            </Box>
        </VStack>
    );
};
