import React from "react";
import { VStack, Text, Box } from "@chakra-ui/react";
import Banner from "components/ui/Banner";
import { DocumentEntity, DocumentStatus } from "types/document/document";

interface KnowledgeBaseStatusProps {
    document: DocumentEntity;
}

export const KnowledgeBaseStatus: React.FC<KnowledgeBaseStatusProps> = ({ document }) => {
    return (
        <VStack align="stretch" spacing={2}>
            <Text
                fontWeight="medium"
                fontSize="11px"
                color="textPrimary"
                letterSpacing="0.08em"
                textTransform="uppercase"
            >
                Statut de la base de connaissances
            </Text>

            {document.status === DocumentStatus.INDEXED && (
                <Banner variant="green" title="Document indexé" mb="16px" flexShrink={0}>
                    Ce document a été indexé avec succès et est disponible pour être utilisé par votre assistant.
                </Banner>
            )}

            {document.status === DocumentStatus.PROCESSING && (
                <Banner variant="orange" title="Document en traitement" mb="16px" flexShrink={0}>
                    <Text fontSize="sm">Ce document est en cours de traitement et sera bientôt disponible.</Text>
                </Banner>
            )}

            {document.status === DocumentStatus.FAILED && (
                <Banner variant="red" title="Échec de l'indexation" mb="16px" flexShrink={0}>
                    {document.indexError && (
                        <Text fontSize="xs" fontFamily="mono">
                            {document.indexError}
                        </Text>
                    )}
                </Banner>
            )}

            {document.status === DocumentStatus.UPLOADED && (
                <Box p={4} bg="gray.50" borderRadius="12px" borderLeft="4px solid" borderColor="gray.400">
                    <Text fontSize="sm" color="gray.700">
                        Ce document est en file d&apos;attente pour le traitement.
                    </Text>
                </Box>
            )}
        </VStack>
    );
};
