import { useEffect, useMemo, useState } from "react";
import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, CheckCircle2, FileText, ScanSearch } from "lucide-react";
import { useStepAnimation } from "hooks/useStepAnimation";
import { StepProgressBar } from "components/ui/StepProgressBar";
import { AnimationStepFrame } from "components/ui/AnimationStepFrame";

export const RerankerAnimation = () => {
    const { step, progress, isInitialized } = useStepAnimation({ stepCount: 4 });

    return (
        <Box position="relative" w="100%" h="100%">
            <AnimatePresence mode="wait">
                {step === 0 && <IncomingResultsStep key="step-0" />}
                {step === 1 && <EvaluationStep key="step-1" />}
                {step === 2 && <ReorganizationStep key="step-2" />}
                {step === 3 && <FinalResultStep key="step-3" />}
            </AnimatePresence>

            <StepProgressBar
                step={step}
                progress={progress}
                stepCount={4}
                isInitialized={isInitialized}
                borderRadius="md"
            />
        </Box>
    );
};

const IncomingResultsStep = () => {
    const cards = [
        { id: 1, relevance: 0.6, delay: 0 },
        { id: 2, relevance: 0.9, delay: 0.1 },
        { id: 3, relevance: 0.4, delay: 0.2 },
    ];

    return (
        <AnimationStepFrame>
            <HStack mb={4}>
                <Icon as={FileText} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    1. Résultats entrants
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
                            bg="surfaceAction"
                            border="2px solid"
                            borderColor="borderAccentCard"
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
        </AnimationStepFrame>
    );
};

const EvaluationStep = () => {
    const [scannedCards, setScannedCards] = useState<Set<number>>(new Set());
    const cards = useMemo(
        () => [
            { id: 1, relevance: 0.6 },
            { id: 2, relevance: 0.9 },
            { id: 3, relevance: 0.4 },
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
        <AnimationStepFrame style={{ position: "relative" }}>
            <HStack mb={4}>
                <Icon as={ScanSearch} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    2. Évaluation de la pertinence
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
                                    bg="surfaceAction"
                                    border="2px solid"
                                    borderColor={isScanned ? "borderAccentCardActive" : "borderAccentCard"}
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
        </AnimationStepFrame>
    );
};

const ReorganizationStep = () => {
    const [phase, setPhase] = useState<"idle" | "selecting" | "moving" | "reordering">("idle");
    const cardsInitial = [
        { id: 1, relevance: 0.6, position: 0 },
        { id: 2, relevance: 0.9, position: 1 },
        { id: 3, relevance: 0.4, position: 2 },
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
        <AnimationStepFrame>
            <HStack mb={4}>
                <Icon as={ArrowUpDown} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    3. Réorganisation intelligente
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
                                bg="surfaceAction"
                                border="2px solid"
                                borderColor={
                                    isBest && phase !== "reordering"
                                        ? "green.400"
                                        : phase === "reordering" && finalIndex === 0
                                          ? "green.400"
                                          : "borderAccentCardMuted"
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
        </AnimationStepFrame>
    );
};

const FinalResultStep = () => {
    const cards = [
        { id: 2, relevance: 0.9, rank: 1 },
        { id: 4, relevance: 0.7, rank: 2 },
        { id: 1, relevance: 0.6, rank: 3 },
    ];
    return (
        <AnimationStepFrame>
            <HStack mb={4}>
                <Icon as={CheckCircle2} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    4. Résultats optimisés
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
                            bg="surfaceAction"
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
        </AnimationStepFrame>
    );
};
