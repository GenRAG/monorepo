import { Box, Text, HStack, VStack } from "@chakra-ui/react";
import { QueryAnimation } from "components/Agents/Workflow/NodeModalContent/Query/QueryAnimation";

const QueryOverviewTab = () => {
    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={2} color="textPrimary">
                    Comment une requête utilisateur entre-t-elle dans le système ?
                </Text>

                <Text fontSize="sm" color="textDescription">
                    La requête est le point de départ de l&apos;ensemble du flux de travail GenRAG.
                </Text>

                <Text fontSize="sm" mt={2} color="textDescription">
                    <strong>Posez une question.</strong> Nous la propageons à travers le pipeline.
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
                <QueryAnimation />
            </Box>

            <VStack spacing={3} align="stretch">
                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.400" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            1. Entrée utilisateur
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        L&apos;utilisateur écrit une question ou une instruction en langage naturel.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.600" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            2. Injection de contexte
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Les instructions système et les métadonnées sont attachées pour guider la récupération.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.700" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            3. Déclenchement du pipeline
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        La requête est envoyée en aval pour la récupération, le classement et la génération.
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

export default QueryOverviewTab;
