import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { DocumentDatabaseAnimation } from "components/Agents/Workflow/NodeModalContent/Document/DocumentAnimation";

const DocumentOverviewTab = () => {
    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={2} color="textPrimary">
                    Comment gérons-nous vos documents ?
                </Text>
                <Text fontSize="sm" color="textDescription">
                    Nous transformons et stockons les documents en vecteurs consultables pour une récupération basée sur
                    l&apos;IA
                </Text>
                <Text fontSize="sm" mt={2} color="textDescription">
                    <strong>Téléchargez</strong> vos documents. Nous gérons <strong>le reste</strong>.
                </Text>
            </Box>

            <Box
                position="relative"
                w="100%"
                h="200px"
                bg="backgroundDefault"
                borderRadius="16px"
                border="1px solid"
                borderColor="borderDivider"
                overflow="hidden"
            >
                <DocumentDatabaseAnimation />
            </Box>

            <VStack spacing={3} align="stretch">
                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.400" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            1. Ingestion de documents
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Vous pouvez télécharger et traiter divers formats de documents (PDF, TXT, DOCX)
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.500" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            2. Vectorisation
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Nous convertissons du texte en vecteurs numériques à l&apos;aide d&apos;intégrations IA
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.600" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            3. Stockage vectoriel
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Nous stockons les vecteurs dans une base de données optimisée pour une récupération rapide
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.700" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            4. Recherche sémantique
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Nous trouvons des documents similaires en fonction du sens, pas seulement des mots-clés
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

export default DocumentOverviewTab;
