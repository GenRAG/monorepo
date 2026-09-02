import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { RerankerAnimation } from "components/Agents/Workflow/NodeModalContent/ReRanker/ReRankerNodeOverviewTab";
import { ImpactBar } from "components/ui/ImpactBar";

export const RerankerInformation = () => {
    return (
        <HStack flex={1} spacing={6} align="stretch" overflowY="auto" w="full">
            <VStack w="full" p={4}>
                <Box w="full">
                    <Text fontSize="lg" fontWeight="bold" mb={2} color="textPrimary">
                        Pourquoi ajouter un Classeur à votre workflow ?
                    </Text>

                    <Text fontSize="sm" color="textDescription">
                        Améliorer la qualité des réponses en priorisant les résultats les plus pertinents avant la
                        génération
                    </Text>

                    <Text fontSize="sm" mt={2} color="textDescription">
                        Mêmes données. <strong>Meilleures réponses.</strong>
                    </Text>
                </Box>

                <Box
                    position="relative"
                    w="100%"
                    h="280px"
                    bg="backgroundDefault"
                    borderRadius="16px"
                    border="1px solid"
                    borderColor="borderPanel"
                    overflow="hidden"
                >
                    <RerankerAnimation />
                </Box>
            </VStack>
            <Box w="1px" alignSelf="stretch" bg="dividerStrong" />
            <VStack w="full" p={4}>
                <VStack w="full" align="stretch">
                    <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                        Impact sur votre workflow
                    </Text>

                    <ImpactBar label="Pertinence de la réponse" value={0.9} />
                    <ImpactBar label="Réduction du bruit" value={0.8} />
                    <ImpactBar label="Efficacité des tokens" value={0.75} />
                    <ImpactBar label="Satisfaction utilisateur" value={0.85} />
                </VStack>
                <VStack spacing={3} mt="5px" align="stretch">
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            Meilleure qualité de réponse
                        </Text>
                        <Text fontSize="xs" color="textDescription">
                            Le modèle de langage reçoit d&apos;abord le contexte le plus pertinent, ce qui entraîne des
                            réponses plus claires et plus précises
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            Hallucinations réduites
                        </Text>
                        <Text fontSize="xs" color="textDescription">
                            Supprimer le contexte non pertinent aide à prévenir les réponses incorrectes ou trompeuses
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            Meilleure utilisation de vos tokens
                        </Text>
                        <Text fontSize="xs" color="textDescription">
                            Des entrées plus propres entraînent souvent des générations plus courtes et plus efficaces
                            en termes de coûts
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            Essentiel pour les grandes bases de connaissances
                        </Text>
                        <Text fontSize="xs" color="textDescription">
                            Particulièrement efficace lorsque de nombreux documents ou fragments sont récupérés
                        </Text>
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
};

export default RerankerInformation;
