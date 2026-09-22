import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { ResponseAnimation } from "components/Agents/Workflow/NodeModalContent/Response/ResponseAnimation";

const ResponseOverviewTab = () => {
    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={2} color="textPrimary">
                    Comment est générée la réponse finale ?
                </Text>

                <Text fontSize="sm" color="textDescription">
                    Nous générons une réponse claire et fiable en combinant votre requête avec les documents les plus
                    pertinents.
                </Text>

                <Text fontSize="sm" mt={2} color="textDescription">
                    La réponse est <strong>contextuelle</strong>, <strong>classée</strong> et prête à l&apos;emploi.
                </Text>
            </Box>

            <Box
                position="relative"
                w="100%"
                h="300px"
                bg="backgroundDefault"
                borderRadius="16px"
                border="1px solid"
                borderColor="borderDivider"
                overflow="hidden"
            >
                <ResponseAnimation />
            </Box>

            <VStack spacing={3} align="stretch">
                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.400" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            1. Agrégation du contexte
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Les documents pertinents et les signaux du workflow sont collectés et préparés.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.500" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            2. Génération de la réponse
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Le modèle de langage génère une réponse ancrée dans le contexte récupéré.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.600" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            3. Affinage de la réponse
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        La réponse est affinée pour garantir clarté, pertinence et cohérence.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.700" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            4. Résultat final
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        La réponse finale est livrée avec les sources utilisées pour la générer.
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

export default ResponseOverviewTab;
