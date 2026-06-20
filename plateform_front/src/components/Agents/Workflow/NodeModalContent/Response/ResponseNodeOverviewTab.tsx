import { useEffect, useState } from "react";
import { Box, HStack, Icon, Tag, Text, VStack, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Copy, ExternalLink, FileText, Sparkles } from "lucide-react";

const ResponseOverviewTab = () => {
    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const { colorMode } = useColorMode();

    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={2} color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                    How Is the Final Answer Generated?
                </Text>

                <Text fontSize="sm" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                    We generate a clear and reliable response by combining your query with the most relevant documents.
                </Text>

                <Text fontSize="sm" mt={2} color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                    The response is <strong>context-aware</strong>, <strong>ranked</strong>, and ready to be used.
                </Text>
            </Box>

            <Box
                position="relative"
                w="100%"
                h="250px"
                bg={bgColor}
                borderRadius="16px"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
            >
                <ResponseAnimation />
            </Box>

            <VStack spacing={3} align="stretch">
                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.400" />
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                            1. Context Aggregation
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        Relevant documents and signals from the workflow are gathered and prepared.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.500" />
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                            2. Answer Generation
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        The language model generates a response grounded in the retrieved context.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.600" />
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                            3. Response Refinement
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        The answer is refined to ensure clarity, relevance, and consistency.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.700" />
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                            4. Final Output
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        The final response is delivered with the sources used to generate it.
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

const ResponseAnimation = () => {
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setProgress(0);

        const initTimeout = setTimeout(() => {
            setIsInitialized(true);
        }, 10);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 100 / 30;
            });
        }, 100);

        const stepTimeout = setTimeout(() => {
            setStep((prev) => (prev + 1) % 4);
        }, 3000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(stepTimeout);
            clearTimeout(initTimeout);
        };
    }, [step]);

    return (
        <Box position="relative" w="100%" h="100%">
            <AnimatePresence mode="wait">
                {step === 0 && <AggregationStep key="step-0" />}
                {step === 1 && <GenerationStep key="step-1" />}
                {step === 2 && <RefinementStep key="step-2" />}
                {step === 3 && <OutputStep key="step-3" />}
            </AnimatePresence>

            <Box position="absolute" bottom={0} left={0} right={0} h="4px" w="100%" bg="grey.300" borderRadius="18px" overflow="hidden">
                <Box h="100%" w={`${((step + progress / 100) / 4) * 100}%`} bg="green.500" transition={isInitialized ? "width 0.1s linear" : "none"} />
            </Box>
        </Box>
    );
};

const AggregationStep = () => {
    const sources = [
        { id: 1, label: "Query", color: "green.400", angle: -60, distance: 120 },
        { id: 2, label: "Doc 1", color: "green.400", angle: -120, distance: 100 },
        { id: 3, label: "Doc 2", color: "green.400", angle: 180, distance: 110 },
        { id: 4, label: "Ranking", color: "green.400", angle: 60, distance: 100 },
    ];

    const bgColor = useColorModeValue("white", "grey.800");

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <HStack mb={6} mt={10}>
                <Icon as={Sparkles} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Aggregating...
                </Text>
            </HStack>
            <Box position="relative" w="200px" h="200px">
                <Box position="absolute" top="30%" left="50%" transform="translate(-50%, -50%)" w="60px" h="60px" bg={bgColor} border="2px solid" borderColor="green.300" borderRadius="24px" display="flex" alignItems="center" justifyContent="center" boxShadow="md">
                    <Icon as={Sparkles} color="green.400" boxSize={6} />
                </Box>
                {sources.map((source, i) => {
                    const startX = Math.cos((source.angle * Math.PI) / 180) * source.distance;
                    const startY = Math.sin((source.angle * Math.PI) / 180) * source.distance;
                    return (
                        <motion.div key={source.id} initial={{ x: startX, y: startY, opacity: 0, scale: 1 }} animate={{ x: 0, y: 0, opacity: [0, 1, 0.8, 0], scale: [1, 1, 0.5, 0] }} transition={{ duration: 2, delay: i * 0.2, ease: "easeInOut" }} style={{ position: "absolute", top: "28%", left: "35%", transform: "translate(-50%, -50%)" }}>
                            <Box px={3} py={1} bg={source.color} borderRadius="999px" fontSize="xs" fontWeight="semibold" color="white" whiteSpace="nowrap" boxShadow="sm">
                                {source.label}
                            </Box>
                        </motion.div>
                    );
                })}
            </Box>
        </motion.div>
    );
};

const GenerationStep = () => {
    const [displayedText, setDisplayedText] = useState("");
    const fullText = "A vector database stores embeddings for\n semantic search and retrieval.";
    const bgColor = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.800", "grey.200");

    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 30);
        return () => clearInterval(typingInterval);
    }, []);

    const displayedLines = displayedText.split("\n");

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <HStack mb={6}>
                <Icon as={FileText} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Generating...
                </Text>
            </HStack>
            <Box w="85%" bg={bgColor} border="2px solid" borderColor="green.300" borderRadius="24px" p={4} boxShadow="md" minH="85px">
                <VStack align="start" spacing={1}>
                    {displayedLines.map((line, lineIndex) => (
                        <HStack key={lineIndex} spacing={0} align="start">
                            <Text fontSize="sm" color={textColor} lineHeight="1.6">
                                {line}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </motion.div>
    );
};

const RefinementStep = () => {
    const [phase, setPhase] = useState<"initial" | "refining1" | "refining2" | "refining3" | "complete">("initial");
    const bgColor = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.800", "grey.200");

    useEffect(() => {
        const timer1 = setTimeout(() => setPhase("refining1"), 500);
        const timer2 = setTimeout(() => setPhase("refining2"), 1100);
        const timer3 = setTimeout(() => setPhase("refining3"), 2000);
        const timer4 = setTimeout(() => setPhase("complete"), 2300);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <HStack mb={6}>
                <Icon as={Sparkles} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Refining...
                </Text>
            </HStack>
            <Box w="85%" bg={bgColor} border="2px solid" borderColor="green.400" borderRadius="24px" p={4} minH="85px" boxShadow={phase === "complete" ? "0 0 20px rgba(34, 197, 94, 0.4)" : "md"} position="relative">
                <Text fontSize="sm" color={textColor} lineHeight="1.8">
                    A vector database stores embeddings for semantic search and retrieval.
                </Text>
                <AnimatePresence>
                    {phase === "complete" && (
                        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} style={{ position: "absolute", top: "8px", right: "8px" }}>
                            <Icon as={Check} color="green.600" boxSize={6} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </motion.div>
    );
};

const OutputStep = () => {
    const [sourcesVisible, setSourcesVisible] = useState(false);
    const bgColor = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.800", "grey.200");
    const sourcesBg = useColorModeValue("grey.50", "grey.900");

    useEffect(() => {
        const timer = setTimeout(() => {
            setSourcesVisible(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <HStack mb={2}>
                <Icon as={Copy} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Sources Available
                </Text>
            </HStack>
            <VStack w="90%" spacing={3} align="stretch">
                <Box w="100%" bg={bgColor} border="2px solid" borderColor="green.300" borderRadius="24px" p={4} boxShadow="md">
                    <VStack align="start" spacing={1}>
                        <HStack spacing={1} align="baseline">
                            <Text fontSize="sm" color={textColor} lineHeight="1.6">
                                A vector database efficiently stores high-dimensional embeddings enabling
                            </Text>
                            <AnimatePresence>
                                {sourcesVisible && (
                                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                                        <Tag size="sm" colorScheme="green" variant="solid" borderRadius="999px">
                                            1
                                        </Tag>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </HStack>
                        <HStack spacing={1} align="baseline">
                            <Text fontSize="sm" color={textColor} lineHeight="1.6">
                                fast semantic search and intelligent retrieval.
                            </Text>
                        </HStack>
                    </VStack>
                </Box>
                <AnimatePresence>
                    {sourcesVisible && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.5, delay: 0.8 }}>
                            <VStack spacing={2} align="stretch" p={3} bg={sourcesBg} borderRadius="18px">
                                <HStack spacing={2}>
                                    <Icon as={BookOpen} color="green.500" boxSize={4} />
                                    <Text fontSize="xs" fontWeight="semibold" color="green.600">
                                        Referenced Sources
                                    </Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Tag size="sm" colorScheme="green" variant="solid" borderRadius="999px">
                                        1
                                    </Tag>
                                    <Text fontSize="xs" color={textColor}>
                                        Vector DB Guide
                                    </Text>
                                    <Icon as={ExternalLink} color="green.400" boxSize={3} ml="auto" />
                                </HStack>
                            </VStack>
                        </motion.div>
                    )}
                </AnimatePresence>
            </VStack>
        </motion.div>
    );
};

export default ResponseOverviewTab;