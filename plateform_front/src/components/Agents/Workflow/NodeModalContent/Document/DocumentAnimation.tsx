import { useEffect, useState } from "react";
import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Database, FileText, Search } from "lucide-react";
import { useStepAnimation } from "hooks/useStepAnimation";
import { StepProgressBar } from "components/ui/StepProgressBar";
import { AnimationStepFrame } from "components/ui/AnimationStepFrame";

export const DocumentDatabaseAnimation = () => {
    const { step, progress, isInitialized } = useStepAnimation({ stepCount: 4, resetInitializedOnStepChange: true });

    return (
        <Box position="relative" w="100%" h="100%">
            <AnimatePresence mode="wait">
                {step === 0 && <DocumentIngestionStep key="step-0" />}
                {step === 1 && <VectorizationStep key="step-1" />}
                {step === 2 && <VectorStorageStep key="step-2" />}
                {step === 3 && <SemanticSearchStep key="step-3" />}
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

const DocumentIngestionStep = () => {
    return (
        <AnimationStepFrame>
            <HStack mb={4}>
                <Icon as={FileText} color="green.400" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.400">
                    1. Ingestion de documents
                </Text>
            </HStack>
            <HStack spacing={4}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.2, duration: 0.6 }}
                    >
                        <VStack
                            w="60px"
                            h="80px"
                            bg="surfaceAction"
                            border="2px solid"
                            borderColor="borderAccentCard"
                            borderRadius="8px"
                            justify="center"
                            boxShadow="md"
                        >
                            <Icon as={FileText} color="iconAccent" boxSize={6} />
                            <Box w="70%" h="2px" bg="grey.300" />
                            <Box w="70%" h="2px" bg="grey.300" />
                            <Box w="50%" h="2px" bg="grey.300" />
                        </VStack>
                    </motion.div>
                ))}
            </HStack>
        </AnimationStepFrame>
    );
};

const VectorizationStep = () => {
    return (
        <AnimationStepFrame>
            <HStack mb={4}>
                <Icon as={ArrowRight} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    2. Vectorisation
                </Text>
            </HStack>
            <Box display="flex" gap={8} alignItems="center">
                <VStack spacing={2}>
                    {[0, 1, 2, 3].map((i) => (
                        <motion.div
                            key={`line-${i}`}
                            initial={{ width: "80px", opacity: 1 }}
                            animate={{
                                width: ["80px", "60px", "0px"],
                                opacity: [1, 0.5, 0],
                            }}
                            transition={{ delay: i * 0.3, duration: 1 }}
                        >
                            <Box h="3px" bg="grey.600" borderRadius="full" />
                        </motion.div>
                    ))}
                </VStack>

                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Icon as={ArrowRight} boxSize={8} color="grey.500" />
                </motion.div>

                <Box display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={2}>
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={`vector-${i}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                delay: 0.8 + i * 0.05,
                                duration: 0.3,
                            }}
                        >
                            <Box w="8px" h="8px" bg="green.500" borderRadius="999px" />
                        </motion.div>
                    ))}
                </Box>
            </Box>
        </AnimationStepFrame>
    );
};

const VectorStorageStep = () => {
    return (
        <AnimationStepFrame>
            <HStack mb={4}>
                <Icon as={Database} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    3. Stockage vectoriel
                </Text>
            </HStack>
            <Box display="grid" gridTemplateColumns="repeat(6, 1fr)" gap={3}>
                {Array.from({ length: 24 }).map((_, i) => {
                    const row = Math.floor(i / 6);
                    const col = i % 6;
                    return (
                        <motion.div
                            key={`storage-${i}`}
                            initial={{
                                x: (col - 2.5) * 100,
                                y: (row - 1.5) * 100,
                                opacity: 0,
                            }}
                            animate={{ x: 0, y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.03, duration: 0.5 }}
                        >
                            <Box
                                w="12px"
                                h="12px"
                                bg="green.400"
                                borderRadius="8px"
                                opacity={0.6 + Math.random() * 0.4}
                            />
                        </motion.div>
                    );
                })}
            </Box>
        </AnimationStepFrame>
    );
};

const SemanticSearchStep = () => {
    const [highlighted, setHighlighted] = useState<number[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHighlighted([12, 7, 13, 11, 17, 18]);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimationStepFrame style={{ position: "relative" }}>
            <HStack mb={4}>
                <Icon as={Search} color="green.700" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    4. Recherche sémantique
                </Text>
            </HStack>
            <Box position="relative">
                <Box display="grid" gridTemplateColumns="repeat(6, 1fr)" gap={3}>
                    {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                            key={`search-${i}`}
                            animate={{
                                scale: highlighted.includes(i) ? 1.3 : 1,
                                opacity: highlighted.includes(i) ? 1 : 0.3,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box
                                w="12px"
                                h="12px"
                                bg={highlighted.includes(i) ? "green.400" : "grey.400"}
                                borderRadius="8px"
                            />
                        </motion.div>
                    ))}
                </Box>

                <motion.div
                    initial={{ x: -50, y: -50, opacity: 0, scale: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: "40%",
                    }}
                >
                    <Icon as={Search} boxSize={10} color="green.400" strokeWidth={2} />
                </motion.div>
            </Box>
        </AnimationStepFrame>
    );
};
