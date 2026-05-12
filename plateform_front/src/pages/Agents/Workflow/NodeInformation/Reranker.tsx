import { Box, HStack, Text, VStack, useColorMode } from "@chakra-ui/react";
import { RerankerAnimation } from "pages/Agents/Workflow/NodeModalContent/ReRankerNodeContent";
import { ImpactBar } from "components/System/Molecules/ImpactBar";

export const RerankerInformation = () => {
    const { colorMode } = useColorMode();

    return (
        <HStack
            flex={1}
            p={4}
            spacing={6}
            align="stretch"
            overflowY="auto"
            w="full"
        >
            <VStack w="full">
                <Box w="full">
                    <Text
                        fontSize="lg"
                        fontWeight="bold"
                        mb={2}
                        color={colorMode === "dark" ? "grey.100" : "grey.900"}
                    >
                        Why Add a Reranker to Your Workflow?
                    </Text>

                    <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                    >
                        Improve answer quality by prioritizing the most relevant
                        results before generation
                    </Text>

                    <Text
                        fontSize="sm"
                        mt={2}
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                    >
                        Same data. <strong>Better answers.</strong>
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
            <Box w="1px" alignSelf="stretch" bg="grey.200" />
            <VStack w="full">
                <VStack w="full" spacing={4} align="stretch">
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={colorMode === "dark" ? "grey.100" : "grey.900"}
                    >
                        Impact on your workflow
                    </Text>

                    <ImpactBar label="Answer relevance" value={0.9} />
                    <ImpactBar label="Noise reduction" value={0.8} />
                    <ImpactBar label="Token efficiency" value={0.75} />
                    <ImpactBar label="User satisfaction" value={0.85} />
                </VStack>
                <VStack spacing={3} mt="5px" align="stretch">
                    <Box>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            Higher answer quality
                        </Text>
                        <Text
                            fontSize="xs"
                            color={
                                colorMode === "dark" ? "grey.400" : "grey.600"
                            }
                        >
                            The language model receives the most relevant
                            context first, leading to clearer and more accurate
                            responses
                        </Text>
                    </Box>

                    <Box>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            Reduced hallucinations
                        </Text>
                        <Text
                            fontSize="xs"
                            color={
                                colorMode === "dark" ? "grey.400" : "grey.600"
                            }
                        >
                            Removing irrelevant context helps prevent incorrect
                            or misleading answers
                        </Text>
                    </Box>

                    <Box>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            Better use of your tokens
                        </Text>
                        <Text
                            fontSize="xs"
                            color={
                                colorMode === "dark" ? "grey.400" : "grey.600"
                            }
                        >
                            Cleaner inputs often result in shorter and more
                            cost-efficient generations
                        </Text>
                    </Box>

                    <Box>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            Essential for large knowledge bases
                        </Text>
                        <Text
                            fontSize="xs"
                            color={
                                colorMode === "dark" ? "grey.400" : "grey.600"
                            }
                        >
                            Particularly effective when many documents or chunks
                            are retrieved
                        </Text>
                    </Box>
                </VStack>
            </VStack>
        </HStack>
    );
};

export default RerankerInformation;
