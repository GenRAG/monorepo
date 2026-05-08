import React from "react";
import {
    Box,
    Button,
    HStack,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { CloudUpload, Upload } from "lucide-react";

interface DocumentEmptyStateProps {
    folderId: string | null;
    folderName?: string;
    onUploadClick: () => void;
    onOpenFolderDrawer?: () => void;
    isMobile?: boolean;
}

const FORMAT_BADGES = ["PDF", "DOCX", "TXT", "MD"];

export const DocumentEmptyState: React.FC<DocumentEmptyStateProps> = ({
    folderId,
    folderName,
    onUploadClick,
    isMobile = false,
}) => {
    const bg = useColorModeValue("white", "grey.950");
    const textColor = useColorModeValue("grey.900", "white");
    const mutedColor = useColorModeValue("grey.500", "grey.400");
    const badgeBg = useColorModeValue("grey.100", "grey.800");
    const badgeColor = useColorModeValue("grey.600", "grey.300");
    const labelColor = useColorModeValue("grey.400", "grey.500");
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <VStack
            justify="center"
            align="center"
            spacing={5}
            borderRadius="12px"
            border="2px dashed"
            borderColor={borderColor}
            bg={bg}
            px={{ base: 6, md: 10 }}
            py={12}
            textAlign="center"
        >
            <Box
                w="64px"
                h="64px"
                borderRadius="16px"
                bg="green.600"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                <CloudUpload size={28} color="white" />
            </Box>

            <VStack spacing={2} maxW="360px">
                <Text
                    fontSize="xl"
                    fontWeight="700"
                    color={textColor}
                    lineHeight="1.2"
                >
                    {folderId
                        ? `Aucun document dans ${folderName ?? "ce dossier"}`
                        : "Aucun document indexé"}
                </Text>
                <Text fontSize="sm" color={mutedColor} lineHeight="1.6">
                    Glissez-déposez vos fichiers ici, ou téléversez-les
                    manuellement. Votre agent utilisera ces documents comme base
                    de connaissance pour répondre aux questions.
                </Text>
            </VStack>

            <Button
                leftIcon={<Upload size={15} />}
                onClick={onUploadClick}
                size={isMobile ? "md" : "md"}
                variant="primary"
            >
                Téléverser vos premiers documents
            </Button>

            <VStack spacing={2}>
                <Text
                    fontSize="10px"
                    fontWeight="700"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    color={labelColor}
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
        </VStack>
    );
};
