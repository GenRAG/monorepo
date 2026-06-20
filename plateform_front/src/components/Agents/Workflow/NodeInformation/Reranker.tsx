import { Box, HStack, Text, VStack, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { RerankerAnimation } from "components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerNodeOverviewTab";
import { ImpactBar } from "components/ui/ImpactBar";

export const RerankerInformation = () => {
    const { colorMode } = useColorMode();
    const borderColor = useColorModeValue("grey.700", "grey.500");

    return (
        <HStack flex={1} spacing={6} align="stretch" overflowY="auto" w="full">
            <VStack w="full" p={4}>
                <Box w="full">
                    <Text fontSize="lg" fontWeight="bold" mb={2} color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                        Pourquoi ajouter un Classeur à votre workflow ?
                    </Text>

                    <Text fontSize="sm" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                        Améliorer la qualité des réponses en priorisant les résultats les plus pertinents avant la
                        génération
                    </Text>

                    <Text fontSize="sm" mt={2} color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                        Mêmes données. <strong>Meilleures réponses.</strong>
                    </Text>
                </Box>

                <Box
                    position="relative"
                    w="100%"
                    h="280px"
                    bg={colorMode === "dark" ? "grey.900" : "white"}
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "grey.800" : "grey.200"}
                    overflow="hidden"
                >
                    <RerankerAnimation />
                </Box>
            </VStack>
            <Box w="1px" alignSelf="stretch" bg={borderColor} />
            <VStack w="full" p={4}>
                <VStack w="full" align="stretch">
                    <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                        Impact sur votre workflow
                    </Text>

                    <ImpactBar label="Pertinence de la réponse" value={0.9} />
                    <ImpactBar label="Réduction du bruit" value={0.8} />
                    <ImpactBar label="Efficacité des tokens" value={0.75} />
                    <ImpactBar label="Satisfaction utilisateur" value={0.85} />
                </VStack>
                <VStack spacing={3} mt="5px" align="stretch">
                    <Box>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "grey.100" : "grey.900"}
                        >
                            Meilleure qualité de réponse
                        </Text>
                        <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                            Le modèle de langage reçoit d&apos;abord le contexte le plus pertinent, ce qui entraîne des
                            réponses plus claires et plus précises
                        </Text>
                    </Box>

                    <Box>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "grey.100" : "grey.900"}
                        >
                            Hallucinations réduites
                        </Text>
                        <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                            Supprimer le contexte non pertinent aide à prévenir les réponses incorrectes ou trompeuses
                        </Text>
                    </Box>

                    <Box>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "grey.100" : "grey.900"}
                        >
                            Meilleure utilisation de vos tokens
                        </Text>
                        <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                            Des entrées plus propres entraînent souvent des générations plus courtes et plus efficaces
                            en termes de coûts
                        </Text>
                    </Box>

                    <Box>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "grey.100" : "grey.900"}
                        >
                            Essentiel pour les grandes bases de connaissances
                        </Text>
                        <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                            Particulièrement efficace lorsque de nombreux documents ou fragments sont récupérés
                        </Text>
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
};

export default RerankerInformation;
