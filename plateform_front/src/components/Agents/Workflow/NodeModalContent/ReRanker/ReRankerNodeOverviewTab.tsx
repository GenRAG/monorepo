import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { RerankerAnimation } from "components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerAnimation";

const RerankerOverviewTab = () => {
    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={2} color="textPrimary">
                    Comment améliorons-nous la pertinence des résultats ?
                </Text>

                <Text fontSize="sm" color="textDescription">
                    Nous analysons et réorganisons les résultats récupérés pour prioriser les informations les plus
                    pertinentes
                </Text>

                <Text fontSize="sm" mt={2} color="textDescription">
                    <strong>Plusieurs résultats en entrée.</strong> Nous affichons les{" "}
                    <strong>meilleurs en sortie</strong>.
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
                <RerankerAnimation />
            </Box>

            <VStack spacing={3} align="stretch">
                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.400" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            1. Résultats entrants
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Nous recevons plusieurs documents ou passages récupérés à partir des étapes précédentes (par
                        exemple, résultats de recherche, ingestion de documents, etc.)
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.500" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            2. Évaluation de la pertinence
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Chaque résultat est évalué par rapport à la question de l&apos;utilisateur à l&apos;aide
                        d&apos;un modèle de classement IA
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.600" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            3. Réorganisation intelligente
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Les résultats sont réorganisés pour placer le contenu le plus pertinent en haut
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.700" />
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            4. Résultat optimisé
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color="textDescription" pl={5}>
                        Les composants en aval reçoivent des résultats de meilleure qualité, mieux classés
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

export default RerankerOverviewTab;
