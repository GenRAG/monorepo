import { useEffect, useMemo, useState } from "react";
import { Box, HStack, Icon, Text, VStack, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, CheckCircle2, FileText, ScanSearch } from "lucide-react";

const RerankerOverviewTab = () => {
    const { colorMode } = useColorMode();
    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={2} color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                    How Do We Improve Result Relevance?
                </Text>

                <Text fontSize="sm" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                    We analyze and reorder retrieved results to prioritize the most relevant information
                </Text>

                <Text fontSize="sm" mt={2} color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                    <strong>Multiple results in.</strong> We surface the <strong>best ones out</strong>.
                </Text>
            </Box>

            <Box
                position="relative"
                w="100%"
                h="300px"
                bg={bgColor}
                borderRadius="16px"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
            >
                <RerankerAnimation />
            </Box>

            <VStack spacing={3} align="stretch">
                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.400" />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "grey.100" : "grey.900"}
                        >
                            1. Incoming Results
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        We receive multiple retrieved documents or passages from previous steps (e.g. search results,
                        document ingestion, etc.)
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.500" />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "grey.100" : "grey.900"}
                        >
                            2. Relevance Evaluation
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        Each result is evaluated against the user question using an AI ranking model
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.600" />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "grey.100" : "grey.900"}
                        >
                            3. Intelligent Reordering
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        Results are reordered to bring the most relevant content to the top
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.700" />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "grey.100" : "grey.900"}
                        >
                            4. Optimized Output
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        Downstream components receive higher-quality, better-ranked results
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

const RerankerAnimation = () => {
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
                {step === 0 && <IncomingResultsStep key="step-0" />}
                {step === 1 && <EvaluationStep key="step-1" />}
                {step === 2 && <ReorganizationStep key="step-2" />}
                {step === 3 && <FinalResultStep key="step-3" />}
            </AnimatePresence>

            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="4px"
                w="100%"
                bg="grey.300"
                borderRadius="md"
                overflow="hidden"
            >
                <Box
                    h="100%"
                    w={`${((step + progress / 100) / 4) * 100}%`}
                    bg="green.500"
                    transition={isInitialized ? "width 0.1s linear" : "none"}
                />
            </Box>
        </Box>
    );
};

const IncomingResultsStep = () => {
    const { colorMode } = useColorMode();
    const cards = [
        { id: 1, relevance: 0.6, delay: 0 },
        { id: 2, relevance: 0.9, delay: 0.1 },
        { id: 3, relevance: 0.4, delay: 0.2 },
        { id: 4, relevance: 0.7, delay: 0.3 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
            }}
        >
            <HStack mb={4}>
                <Icon as={FileText} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    1. Incoming Results
                </Text>
            </HStack>
            <VStack spacing={3} w="80%">
                {cards.map((card) => (
                    <motion.div
                        key={card.id}
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 0.6 + card.relevance * 0.2 }}
                        transition={{ delay: card.delay, duration: 0.5 }}
                        style={{ width: "100%" }}
                    >
                        <Box
                            h="40px"
                            bg={colorMode === "dark" ? "grey.800" : "white"}
                            border="2px solid"
                            borderColor={colorMode === "dark" ? "green.300" : "green.200"}
                            borderRadius="12px"
                            display="flex"
                            alignItems="center"
                            px={3}
                            boxShadow="sm"
                        >
                            <HStack spacing={2} w="100%">
                                <Box w="24px" h="24px" borderRadius="8px" bg="green.100" />
                                <Box flex={1} h="3px" bg="green.200" borderRadius="999px" />
                                <Box w="60px" h="3px" bg="green.200" borderRadius="999px" />
                            </HStack>
                        </Box>
                    </motion.div>
                ))}
            </VStack>
        </motion.div>
    );
};

const EvaluationStep = () => {
    const { colorMode } = useColorMode();
    const [scannedCards, setScannedCards] = useState<Set<number>>(new Set());
    const cards = useMemo(
        () => [
            { id: 1, relevance: 0.6 },
            { id: 2, relevance: 0.9 },
            { id: 3, relevance: 0.4 },
            { id: 4, relevance: 0.7 },
        ],
        [],
    );
    const cardPositions = cards.map((_, index) => index * 52);

    useEffect(() => {
        setScannedCards(new Set());
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 1700, 1);
            const currentY = -20 + (230 - -20) * progress;

            const newScannedCards = new Set<number>();
            cardPositions.forEach((cardTop, index) => {
                const cardBottom = cardTop + 40;
                if (currentY >= cardTop && currentY <= cardBottom) {
                    newScannedCards.add(cards[index].id);
                }
            });

            setScannedCards(newScannedCards);
            if (progress >= 1) clearInterval(interval);
        }, 16);

        return () => clearInterval(interval);
    }, [cardPositions, cards]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                position: "relative",
            }}
        >
            <HStack mb={4}>
                <Icon as={ScanSearch} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    2. Relevance Evaluation
                </Text>
            </HStack>
            <Box position="relative" w="80%">
                <VStack spacing={3}>
                    {cards.map((card, index) => {
                        const isScanned = scannedCards.has(card.id);
                        return (
                            <motion.div
                                key={card.id}
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ delay: index * 0.2, duration: 1 }}
                                style={{ width: "100%" }}
                            >
                                <Box
                                    h="40px"
                                    bg={colorMode === "dark" ? "grey.800" : "white"}
                                    border="2px solid"
                                    borderColor={
                                        isScanned
                                            ? colorMode === "dark"
                                                ? "green.500"
                                                : "green.400"
                                            : colorMode === "dark"
                                              ? "green.300"
                                              : "green.200"
                                    }
                                    borderRadius="12px"
                                    display="flex"
                                    alignItems="center"
                                    px={3}
                                    boxShadow="sm"
                                    opacity={0.6 + card.relevance * 0.2}
                                    transition="all 0.3s ease"
                                >
                                    <HStack spacing={2} w="100%">
                                        <Box
                                            w="24px"
                                            h="24px"
                                            borderRadius="8px"
                                            bg={isScanned ? "green.300" : "green.100"}
                                            transition="background-color 0.3s ease"
                                        />
                                        <Box
                                            flex={1}
                                            h="3px"
                                            bg={isScanned ? "green.400" : "green.200"}
                                            borderRadius="999px"
                                            transition="background-color 0.3s ease"
                                        />
                                        <Box
                                            w="60px"
                                            h="3px"
                                            bg={isScanned ? "green.400" : "green.200"}
                                            borderRadius="999px"
                                            transition="background-color 0.3s ease"
                                        />
                                    </HStack>
                                </Box>
                            </motion.div>
                        );
                    })}
                </VStack>
            </Box>
        </motion.div>
    );
};

const ReorganizationStep = () => {
    const [phase, setPhase] = useState<"idle" | "selecting" | "moving" | "reordering">("idle");
    const { colorMode } = useColorMode();
    const cardsInitial = [
        { id: 1, relevance: 0.6, position: 0 },
        { id: 2, relevance: 0.9, position: 1 },
        { id: 3, relevance: 0.4, position: 2 },
        { id: 4, relevance: 0.7, position: 3 },
    ];
    const cardsSorted = [...cardsInitial].sort((a, b) => b.relevance - a.relevance);
    const bestCard = cardsSorted[0];

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase("selecting"), 400),
            setTimeout(() => setPhase("moving"), 1200),
            setTimeout(() => setPhase("reordering"), 1800),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
            }}
        >
            <HStack mb={4}>
                <Icon as={ArrowUpDown} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    3. Intelligent Reordering
                </Text>
            </HStack>
            <Box position="relative" w="80%" h="200px">
                {cardsInitial.map((card) => {
                    const isBest = card.id === bestCard.id;
                    const finalIndex = cardsSorted.findIndex((c) => c.id === card.id);
                    return (
                        <motion.div
                            key={card.id}
                            style={{
                                position: "absolute",
                                width: "100%",
                                zIndex: isBest && phase !== "reordering" ? 10 : 5 - finalIndex,
                            }}
                            animate={{
                                y: phase === "reordering" ? finalIndex * 56 : card.position * 56,
                                scale: isBest ? 1.15 : 1,
                                opacity: phase === "moving" && !isBest ? 0.3 : 0.5 + card.relevance * 0.5,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 150,
                                damping: 25,
                                delay: phase === "reordering" && !isBest ? finalIndex * 0.1 : 0,
                            }}
                        >
                            <Box
                                h="40px"
                                bg={colorMode === "dark" ? "grey.800" : "white"}
                                border="2px solid"
                                borderColor={
                                    isBest && phase !== "reordering"
                                        ? "green.400"
                                        : phase === "reordering" && finalIndex === 0
                                          ? "green.400"
                                          : colorMode === "dark"
                                            ? "green.700"
                                            : "green.200"
                                }
                                borderRadius="12px"
                                display="flex"
                                alignItems="center"
                                px={3}
                            >
                                <HStack spacing={2} w="100%">
                                    <Box
                                        w="24px"
                                        h="24px"
                                        borderRadius="8px"
                                        bg={
                                            (isBest && phase !== "reordering") ||
                                            (phase === "reordering" && finalIndex === 0)
                                                ? "green.200"
                                                : "green.100"
                                        }
                                    />
                                    <Box flex={1} h="3px" bg="green.200" borderRadius="999px" />
                                    <Box w="60px" h="3px" bg="green.200" borderRadius="999px" />
                                </HStack>
                            </Box>
                        </motion.div>
                    );
                })}
            </Box>
        </motion.div>
    );
};

const FinalResultStep = () => {
    const cards = [
        { id: 2, relevance: 0.9, rank: 1 },
        { id: 4, relevance: 0.7, rank: 2 },
        { id: 1, relevance: 0.6, rank: 3 },
        { id: 3, relevance: 0.4, rank: 4 },
    ];
    const { colorMode } = useColorMode();
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
            }}
        >
            <HStack mb={4}>
                <Icon as={CheckCircle2} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    4. Optimized Results
                </Text>
            </HStack>
            <VStack spacing={3} w="80%">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        animate={{ scale: index === 0 ? [1, 1.05, 1] : 1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        style={{ width: "100%" }}
                    >
                        <Box
                            h={index === 0 ? "50px" : "40px"}
                            bg={colorMode === "dark" ? "grey.800" : "white"}
                            border="2px solid"
                            borderColor={index === 0 ? "green.400" : "green.300"}
                            borderRadius="12px"
                            display="flex"
                            alignItems="center"
                            px={3}
                            boxShadow={index === 0 ? "0 0 20px rgba(34, 197, 94, 0.4)" : "sm"}
                            opacity={index === 0 ? 1 : 0.4 + index * 0.1}
                        >
                            <HStack spacing={2} w="100%">
                                <Box
                                    w={index === 0 ? "32px" : "24px"}
                                    h={index === 0 ? "32px" : "24px"}
                                    borderRadius="8px"
                                    bg={index === 0 ? "green.200" : "green.100"}
                                />
                                <Box
                                    flex={1}
                                    h={index === 0 ? "4px" : "3px"}
                                    bg={index === 0 ? "green.300" : "green.200"}
                                    borderRadius="999px"
                                />
                                <Box
                                    w="60px"
                                    h={index === 0 ? "4px" : "3px"}
                                    bg={index === 0 ? "green.300" : "green.200"}
                                    borderRadius="999px"
                                />
                                {index === 0 && <Icon as={CheckCircle2} color="green.500" boxSize={5} />}
                            </HStack>
                        </Box>
                    </motion.div>
                ))}
            </VStack>
        </motion.div>
    );
};

export default RerankerOverviewTab;
