import React from "react";
import { Box, Button, Card, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { CloudUpload, Upload } from "lucide-react";
import BoxIcon from "components/ui/BoxIcon";

interface DocumentEmptyStateProps {
    folderId: string | null;
    folderName?: string;
    onUploadClick: () => void;
    onOpenFolderDrawer?: () => void;
    isMobile?: boolean;
}

const FORMAT_BADGES = ["PDF", "TXT", "MD", "HTML", "DOCX"];

export const DocumentEmptyState: React.FC<DocumentEmptyStateProps> = ({
    folderId,
    folderName,
    onUploadClick,
    isMobile = false,
}) => {
    const badgeBg = useColorModeValue("grey.100", "grey.800");
    const badgeColor = useColorModeValue("grey.600", "grey.300");

    return (
        <Card
            size="md"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={5}
            bg="surfaceHover"
            textAlign="center"
        >
            <BoxIcon icon={CloudUpload} size="xl" />

            <VStack spacing={2} maxW="360px">
                <Text fontSize="xl" fontWeight="700" color="textPrimary" lineHeight="1.2">
                    {folderId ? `Aucun document dans ${folderName ?? "ce dossier"}` : "Aucun document indexé"}
                </Text>
                <Text variant="body-sm-muted" lineHeight="1.6">
                    Glissez-déposez vos fichiers ici, ou téléversez-les manuellement. Votre agent utilisera ces
                    documents comme base de connaissance pour répondre aux questions.
                </Text>
            </VStack>

            <Button
                leftIcon={<Upload size={15} />}
                onClick={onUploadClick}
                size={isMobile ? "md" : "md"}
                variant="superPrimary"
            >
                Téléverser vos premiers documents
            </Button>

            <VStack spacing={2}>
                <Text
                    fontSize="10px"
                    fontWeight="700"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    color="textMuted"
                >
                    Formats
                </Text>
                <HStack spacing={2}>
                    {FORMAT_BADGES.map((fmt) => (
                        <Box
                            key={fmt}
                            bg={badgeBg}
                            color={badgeColor}
                            fontSize="11px"
                            fontWeight="600"
                            px={3}
                            py="4px"
                            borderRadius="full"
                        >
                            {fmt}
                        </Box>
                    ))}
                </HStack>
            </VStack>
        </Card>
    );
};
