import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { RewriterAnimation } from "components/Agents/Workflow/NodeModalContent/Rewriter/RewriterNodeContent";
import { ImpactBar } from "components/ui/ImpactBar";

export const RewriterInformation = () => {
    return (
        <HStack flex={1} spacing={6} align="stretch" overflowY="auto" w="full">
            <VStack w="full" p={4}>
                <Box w="full">
                    <Text fontSize="lg" fontWeight="bold" mb={2} color="textPrimary">
                        Pourquoi ajouter un Reformulateur à votre workflow ?
                    </Text>

                    <Text fontSize="sm" color="textDescription">
                        Améliorer la précision de la recherche en reformulant la question de l&apos;utilisateur avant de
                        la soumettre au retriever.
                    </Text>

                    <Text fontSize="sm" mt={2} color="textDescription">
                        Question vague en entrée. <strong>Requête optimisée</strong> en sortie.
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
                    <RewriterAnimation />
                </Box>
            </VStack>
            <Box w="1px" alignSelf="stretch" bg="dividerStrong" />
            <VStack w="full" p={4}>
                <VStack w="full" align="stretch">
                    <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                        Impact sur votre workflow
                    </Text>

                    <ImpactBar label="Pertinence des documents récupérés" value={0.88} />
                    <ImpactBar label="Précision de la recherche" value={0.82} />
                    <ImpactBar label="Qualité de la réponse finale" value={0.78} />
                    <ImpactBar label="Robustesse aux questions vagues" value={0.9} />
                </VStack>
                <VStack spacing={3} mt="5px" align="stretch">
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            Meilleure correspondance avec vos documents
                        </Text>
                        <Text fontSize="xs" color="textDescription">
                            La question reformulée utilise le vocabulaire exact de vos documents, augmentant la
                            probabilité de retrouver les bons passages.
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            Résistance aux questions ambiguës
                        </Text>
                        <Text fontSize="xs" color="textDescription">
                            Les questions courtes ou mal formulées sont enrichies du contexte nécessaire pour une
                            recherche efficace.
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            Réduction des faux positifs
                        </Text>
                        <Text fontSize="xs" color="textDescription">
                            Une requête plus précise réduit le nombre de documents non pertinents récupérés, améliorant
                            ainsi la réponse générée.
                        </Text>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="textPrimary">
                            Complémentaire au bloc Classement
                        </Text>
                        <Text fontSize="xs" color="textDescription">
                            Combiné au bloc Classement, il agit en amont pour améliorer la qualité de la récupération et
                            en aval pour affiner le classement.
                        </Text>
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
};

export default RewriterInformation;
