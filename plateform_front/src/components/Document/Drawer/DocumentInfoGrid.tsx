import React from "react";
import { VStack, Card, Grid, GridItem, Text, HStack } from "@chakra-ui/react";
import { File, Clock, Database } from "lucide-react";
import { DocumentEntity } from "types/document/document";
import { formatFileSize, formatDateTime, getFileTypeLabel } from "utils/documentFormatters";
import BoxIcon from "components/ui/BoxIcon";

interface DocumentInfoGridProps {
    document: DocumentEntity;
}

export const DocumentInfoGrid: React.FC<DocumentInfoGridProps> = ({ document }) => {
    return (
        <VStack align="stretch" spacing={2}>
            <Text variant="caption-md">Informations du document</Text>

            <Card size="none" bg="surfaceModal" borderWidth="0.5px" overflow="hidden">
                <Grid templateColumns="1fr 1fr" borderBottom="0.5px solid" borderColor="borderDefault">
                    <GridItem p={4} borderRight="0.5px solid" borderColor="borderDefault">
                        <Text variant="body-xs-muted">Type</Text>
                        <HStack spacing={2} mt={2}>
                            <BoxIcon icon={File} size="sm" color="grey.400" />
                            <Text fontSize="13px" fontWeight="medium">
                                {getFileTypeLabel(document.mimeType)}
                            </Text>
                        </HStack>
                    </GridItem>
                    <GridItem p={4}>
                        <Text variant="body-xs-muted">Taille</Text>
                        <HStack spacing={2} mt={2}>
                            <BoxIcon icon={Database} size="sm" color="grey.400" />
                            <Text fontSize="13px" fontWeight="medium">
                                {formatFileSize(document.size)}
                            </Text>
                        </HStack>
                    </GridItem>
                </Grid>
                <Grid templateColumns="1fr 1fr" borderBottom="0.5px solid" borderColor="borderDefault">
                    <GridItem p={4} borderRight="0.5px solid" borderColor="borderDefault">
                        <Text variant="body-xs-muted">Téléversé</Text>
                        <HStack spacing={2} mt={2}>
                            <BoxIcon icon={Clock} size="sm" color="grey.400" />
                            <Text fontSize="13px" fontWeight="medium">
                                {formatDateTime(document.createdAt)}
                            </Text>
                        </HStack>
                    </GridItem>
                    {document.indexedAt && (
                        <GridItem p={4}>
                            <Text variant="body-xs-muted">Indexé</Text>
                            <HStack spacing={2} mt={2}>
                                <BoxIcon icon={Clock} size="sm" color="grey.400" />
                                <Text fontSize="13px" fontWeight="medium">
                                    {formatDateTime(document.indexedAt)}
                                </Text>
                            </HStack>
                        </GridItem>
                    )}
                </Grid>
            </Card>
        </VStack>
    );
};
