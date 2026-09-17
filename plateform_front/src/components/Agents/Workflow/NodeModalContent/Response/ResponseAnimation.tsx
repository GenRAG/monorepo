import { useEffect, useState } from "react";
import { Box, HStack, Icon, Tag, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Copy, ExternalLink, FileText, Sparkles } from "lucide-react";
import { useStepAnimation } from "hooks/useStepAnimation";
import { StepProgressBar } from "components/ui/StepProgressBar";
import { AnimationStepFrame } from "components/ui/AnimationStepFrame";

export const ResponseAnimation = () => {
    const { step, progress, isInitialized } = useStepAnimation({ stepCount: 4 });

    return (
        <Box position="relative" w="100%" h="100%">
            <AnimatePresence mode="wait">
                {step === 0 && <AggregationStep key="step-0" />}
                {step === 1 && <GenerationStep key="step-1" />}
                {step === 2 && <RefinementStep key="step-2" />}
                {step === 3 && <OutputStep key="step-3" />}
            </AnimatePresence>

            <StepProgressBar step={step} progress={progress} stepCount={4} isInitialized={isInitialized} />
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

    return (
        <AnimationStepFrame>
            <HStack mb={6} mt={10}>
                <Icon as={Sparkles} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Agrégation...
                </Text>
            </HStack>
            <Box position="relative" w="200px" h="200px">
                <Box
                    position="absolute"
                    top="30%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    w="60px"
                    h="60px"
                    bg="surfaceAction"
                    border="2px solid"
                    borderColor="green.300"
                    borderRadius="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="md"
                >
                    <Icon as={Sparkles} color="green.400" boxSize={6} />
                </Box>
                {sources.map((source, i) => {
                    const startX = Math.cos((source.angle * Math.PI) / 180) * source.distance;
                    const startY = Math.sin((source.angle * Math.PI) / 180) * source.distance;
                    return (
                        <motion.div
                            key={source.id}
                            initial={{ x: startX, y: startY, opacity: 0, scale: 1 }}
                            animate={{ x: 0, y: 0, opacity: [0, 1, 0.8, 0], scale: [1, 1, 0.5, 0] }}
                            transition={{ duration: 2, delay: i * 0.2, ease: "easeInOut" }}
                            style={{
                                position: "absolute",
                                top: "28%",
                                left: "35%",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <Box
                                px={3}
                                py={1}
                                bg={source.color}
                                borderRadius="999px"
                                fontSize="xs"
                                fontWeight="semibold"
                                color="white"
                                whiteSpace="nowrap"
                                boxShadow="sm"
                            >
                                {source.label}
                            </Box>
                        </motion.div>
                    );
                })}
            </Box>
        </AnimationStepFrame>
    );
};

const GenerationStep = () => {
    const [displayedText, setDisplayedText] = useState("");
    const fullText = "Une base vectorielle stocke des embeddings\n pour la recherche sémantique.";

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
        <AnimationStepFrame>
            <HStack mb={6}>
                <Icon as={FileText} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Génération...
                </Text>
            </HStack>
            <Box
                w="85%"
                bg="surfaceAction"
                border="2px solid"
                borderColor="green.300"
                borderRadius="24px"
                p={4}
                boxShadow="md"
                minH="85px"
            >
                <VStack align="start" spacing={1}>
                    {displayedLines.map((line, lineIndex) => (
                        <HStack key={lineIndex} spacing={0} align="start">
                            <Text fontSize="sm" color="textSecondary" lineHeight="1.6">
                                {line}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </AnimationStepFrame>
    );
};

const RefinementStep = () => {
    const [phase, setPhase] = useState<"initial" | "refining1" | "refining2" | "refining3" | "complete">("initial");

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
        <AnimationStepFrame>
            <HStack mb={6}>
                <Icon as={Sparkles} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Affinage...
                </Text>
            </HStack>
            <Box
                w="85%"
                bg="surfaceAction"
                border="2px solid"
                borderColor="green.400"
                borderRadius="24px"
                p={4}
                minH="85px"
                boxShadow={phase === "complete" ? "0 0 20px rgba(34, 197, 94, 0.4)" : "md"}
                position="relative"
            >
                <Text fontSize="sm" color="textSecondary" lineHeight="1.8">
                    Une base vectorielle stocke des embeddings pour la recherche sémantique.
                </Text>
                <AnimatePresence>
                    {phase === "complete" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            style={{ position: "absolute", top: "8px", right: "8px" }}
                        >
                            <Icon as={Check} color="green.600" boxSize={6} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </AnimationStepFrame>
    );
};

const OutputStep = () => {
    const [sourcesVisible, setSourcesVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSourcesVisible(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimationStepFrame>
            <HStack mb={2}>
                <Icon as={Copy} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Sources disponibles
                </Text>
            </HStack>
            <VStack w="90%" spacing={3} align="stretch">
                <Box
                    w="100%"
                    bg="surfaceAction"
                    border="2px solid"
                    borderColor="green.300"
                    borderRadius="24px"
                    p={4}
                    boxShadow="md"
                >
                    <VStack align="start" spacing={1}>
                        <HStack spacing={1} align="baseline">
                            <Text fontSize="sm" color="textSecondary" lineHeight="1.6">
                                Une base vectorielle stocke efficacement des embeddings haute dimension permettant
                            </Text>
                            <AnimatePresence>
                                {sourcesVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Tag size="sm" colorScheme="green" variant="solid" borderRadius="999px">
                                            1
                                        </Tag>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </HStack>
                        <HStack spacing={1} align="baseline">
                            <Text fontSize="sm" color="textSecondary" lineHeight="1.6">
                                une recherche sémantique rapide et une récupération intelligente.
                            </Text>
                        </HStack>
                    </VStack>
                </Box>
                <AnimatePresence>
                    {sourcesVisible && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <VStack spacing={2} align="stretch" p={3} bg="surfaceHover" borderRadius="18px">
                                <HStack spacing={2}>
                                    <Icon as={BookOpen} color="green.500" boxSize={4} />
                                    <Text fontSize="xs" fontWeight="semibold" color="green.600">
                                        Sources référencées
                                    </Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Tag size="sm" colorScheme="green" variant="solid" borderRadius="999px">
                                        1
                                    </Tag>
                                    <Text fontSize="xs" color="textSecondary">
                                        Guide Base Vectorielle
                                    </Text>
                                    <Icon as={ExternalLink} color="green.400" boxSize={3} ml="auto" />
                                </HStack>
                            </VStack>
                        </motion.div>
                    )}
                </AnimatePresence>
            </VStack>
        </AnimationStepFrame>
    );
};
