import React from "react";
import { VStack, Box, Grid, GridItem, Text, HStack, useColorModeValue } from "@chakra-ui/react";
import { File, Clock, Database } from "lucide-react";
import { DocumentEntity } from "types/document/document";
import { formatFileSize, formatDateTime, getFileTypeLabel } from "utils/documentFormatters";
import BoxIcon from "components/ui/BoxIcon";

interface DocumentInfoGridProps {
    document: DocumentEntity;
}

export const DocumentInfoGrid: React.FC<DocumentInfoGridProps> = ({ document }) => {
    const bgColor = useColorModeValue("white", "grey.900");

    return (
        <VStack align="stretch" spacing={2}>
            <Text
                fontWeight="medium"
                fontSize="11px"
                color="textPrimary"
                letterSpacing="0.08em"
                textTransform="uppercase"
            >
                Informations du document
            </Text>

            <Box bg={bgColor} border="0.5px solid" borderColor="borderDefault" borderRadius="12px" overflow="hidden">
                <Grid templateColumns="1fr 1fr" borderBottom="0.5px solid" borderColor="borderDefault">
                    <GridItem p={4} borderRight="0.5px solid" borderColor="borderDefault">
                        <Text
                            fontSize="11px"
                            color="textMuted"
                            fontWeight="medium"
                            textTransform="uppercase"
                            letterSpacing="0.04em"
                            mb={1}
                        >
                            Type
                        </Text>
                        <HStack spacing={2}>
                            <BoxIcon icon={File} size="sm" color="gray.400" />
                            <Text fontSize="13px" fontWeight="medium">
                                {getFileTypeLabel(document.mimeType)}
                            </Text>
                        </HStack>
                    </GridItem>
                    <GridItem p={4}>
                        <Text
                            fontSize="11px"
                            color="textMuted"
                            fontWeight="medium"
                            textTransform="uppercase"
                            letterSpacing="0.04em"
                            mb={1}
                        >
                            Taille
                        </Text>
                        <HStack spacing={2}>
                            <BoxIcon icon={Database} size="sm" color="gray.400" />
                            <Text fontSize="13px" fontWeight="medium">
                                {formatFileSize(document.size)}
                            </Text>
                        </HStack>
                    </GridItem>
                </Grid>
                <Grid templateColumns="1fr 1fr" borderBottom="0.5px solid" borderColor="borderDefault">
                    <GridItem p={4} borderRight="0.5px solid" borderColor="borderDefault">
                        <Text
                            fontSize="11px"
                            color="textMuted"
                            fontWeight="medium"
                            textTransform="uppercase"
                            letterSpacing="0.04em"
                            mb={1}
                        >
                            Téléversé
                        </Text>
                        <HStack spacing={2}>
                            <BoxIcon icon={Clock} size="sm" color="gray.400" />
                            <Text fontSize="13px" fontWeight="medium">
                                {formatDateTime(document.createdAt)}
                            </Text>
                        </HStack>
                    </GridItem>
                    {document.indexedAt && (
                        <GridItem p={4}>
                            <Text
                                fontSize="11px"
                                color="textMuted"
                                fontWeight="medium"
                                textTransform="uppercase"
                                letterSpacing="0.04em"
                                mb={1}
                            >
                                Indexé
                            </Text>
                            <HStack spacing={2}>
                                <BoxIcon icon={Clock} size="sm" color="gray.400" />
                                <Text fontSize="13px" fontWeight="medium">
                                    {formatDateTime(document.indexedAt)}
                                </Text>
                            </HStack>
                        </GridItem>
                    )}
                </Grid>
            </Box>
        </VStack>
    );
};
