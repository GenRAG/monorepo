import { useEffect, useState } from "react";
import { Box, HStack, Icon, Text, VStack, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Database, MessageSquare, Send, Sparkles, User, WandSparkles, Zap } from "lucide-react";

const QueryOverviewTab = () => {
    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const { colorMode } = useColorMode();

    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={2} color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                    Comment une requête utilisateur entre-t-elle dans le système ?
                </Text>

                <Text fontSize="sm" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                    La requête est le point de départ de l&apos;ensemble du flux de travail GenRAG.
                </Text>

                <Text fontSize="sm" mt={2} color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                    <strong>Posez une question.</strong> Nous la propageons à travers le pipeline.
                </Text>
            </Box>

            <Box
                position="relative"
                w="100%"
                h="200px"
                bg={bgColor}
                borderRadius="16px"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
            >
                <QueryAnimation />
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
                            1. Entrée utilisateur
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        L&apos;utilisateur écrit une question ou une instruction en langage naturel.
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
                            2. Normalisation de requête
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        La requête est nettoyée et formatée pour être comprise par le système.
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
                            3. Injection de contexte
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        Les instructions système et les métadonnées sont attachées pour guider la récupération.
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
                            4. Déclenchement du pipeline
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        La requête est envoyée en aval pour la récupération, le classement et la génération.
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

const QueryAnimation = () => {
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
                {step === 0 && <UserInputStep key="step-0" />}
                {step === 1 && <QueryNormalizationStep key="step-1" />}
                {step === 2 && <ContextInjectionStep key="step-2" />}
                {step === 3 && <PipelineTriggerStep key="step-3" />}
            </AnimatePresence>

            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="4px"
                w="100%"
                bg="grey.300"
                borderRadius="18px"
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

const UserInputStep = () => {
    const [displayedText, setDisplayedText] = useState("");
    const fullText = "What is a vector DB?";
    const bgColor = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.800", "grey.200");
    const borderColor = useColorModeValue("green.100", "green.600");

    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 80);

        return () => clearInterval(typingInterval);
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
            <HStack mb={6}>
                <Icon as={MessageSquare} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    User Input
                </Text>
            </HStack>

            <Box w="85%" bg={bgColor} border="2px solid" borderColor={borderColor} borderRadius="48px" boxShadow="sm">
                <HStack spacing={3} p={1} align="center">
                    <Box
                        w="36px"
                        h="36px"
                        bg="green.100"
                        borderRadius="999px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <Icon as={User} color="green.600" boxSize={5} />
                    </Box>

                    <Box flex={1} display="flex" alignItems="center" minH="36px">
                        <HStack spacing={0}>
                            <Text fontSize="sm" color={textColor}>
                                {displayedText}
                            </Text>
                            <motion.div
                                animate={{
                                    opacity: [1, 1, 0, 0],
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                style={{
                                    width: "2px",
                                    height: "20px",
                                    backgroundColor: "#12B98C",
                                    borderRadius: "1px",
                                    marginLeft: "2px",
                                }}
                            />
                        </HStack>
                    </Box>

                    <Box
                        w="36px"
                        h="36px"
                        bg="green.100"
                        borderRadius="999px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <Icon as={Send} color="green.400" boxSize={4} />
                    </Box>
                </HStack>
            </Box>
        </motion.div>
    );
};

const QueryNormalizationStep = () => {
    const [phase, setPhase] = useState<"initial" | "lowercase" | "deleting" | "replacing" | "complete">("initial");
    const bgColor = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.800", "grey.200");

    useEffect(() => {
        const timer1 = setTimeout(() => setPhase("lowercase"), 400);
        const timer2 = setTimeout(() => setPhase("deleting"), 900);
        const timer3 = setTimeout(() => setPhase("replacing"), 1400);
        const timer4 = setTimeout(() => setPhase("complete"), 2000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, []);

    const isLowercase = phase !== "initial";
    const isDeleting = phase === "deleting";
    const isReplacing = phase === "replacing" || phase === "complete";

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
            <HStack mb={6}>
                <Icon as={WandSparkles} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Query Normalization
                </Text>
            </HStack>

            <Box
                w="85%"
                bg={bgColor}
                border="2px solid"
                borderColor="green.300"
                borderRadius="24px"
                p={4}
                boxShadow="md"
                minH="60px"
                display="flex"
                alignItems="center"
            >
                <HStack spacing={1} flexWrap="wrap" align="center">
                    <Box position="relative">
                        <motion.div
                            animate={{
                                y: isLowercase ? [-2, 0] : 0,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Text
                                fontSize="sm"
                                color={isLowercase ? "green.400" : textColor}
                                fontWeight={isLowercase ? "medium" : "normal"}
                            >
                                {isLowercase ? "what" : "What"}
                            </Text>
                        </motion.div>
                    </Box>

                    <Text fontSize="sm" color={textColor}>
                        is
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                        a
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                        vector
                    </Text>
                    <Box position="relative" display="inline-block" minW="70px">
                        <motion.div
                            animate={{
                                opacity: isReplacing ? 0 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: "relative",
                                display: "inline-block",
                            }}
                        >
                            <HStack spacing={0}>
                                <Text fontSize="sm" color={textColor} display="inline">
                                    DB?
                                </Text>
                            </HStack>
                            {isDeleting && (
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: 0,
                                        height: "2px",
                                        backgroundColor: "#EF4444",
                                    }}
                                />
                            )}
                        </motion.div>
                        {isReplacing && (
                            <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                }}
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <Box position="relative" display="inline-block">
                                    <Text fontSize="sm" color="green.500" fontWeight="semibold" display="inline">
                                        database
                                    </Text>
                                    {phase === "replacing" && (
                                        <motion.div
                                            animate={{
                                                opacity: [0, 0.4, 0],
                                                scale: [0.95, 1.05, 0.95],
                                            }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: 2,
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: -3,
                                                left: -3,
                                                right: -3,
                                                bottom: -3,
                                                backgroundColor: "rgba(34, 197, 94, 0.15)",
                                                borderRadius: "6px",
                                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                                zIndex: -1,
                                            }}
                                        />
                                    )}
                                </Box>
                            </motion.div>
                        )}
                    </Box>
                </HStack>
            </Box>
        </motion.div>
    );
};

const ContextInjectionStep = () => {
    const [merged, setMerged] = useState(false);
    const bgColor = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.800", "grey.200");
    const enrichieBg = useColorModeValue("green.50", "green.900");

    const contextItems = [
        {
            id: 1,
            label: "System Instructions",
            color: "green.400",
            angle: -120,
            distance: 100,
        },
        {
            id: 2,
            label: "User Context",
            color: "green.500",
            angle: 180,
            distance: 90,
        },
        {
            id: 3,
            label: "Metadata",
            color: "green.300",
            angle: 120,
            distance: 95,
        },
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setMerged(true);
        }, 1800);
        return () => clearTimeout(timer);
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
            <HStack>
                <Icon as={Database} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Context Injection
                </Text>
            </HStack>

            <Box position="relative" w="300px" h="100px">
                <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="200px" zIndex={2}>
                    <motion.div
                        animate={{
                            scale: merged ? [1, 1.08, 1.05] : 1,
                        }}
                        transition={{
                            duration: 0.6,
                        }}
                    >
                        <Box
                            w="100%"
                            bg={merged ? enrichieBg : bgColor}
                            border="2px solid"
                            borderColor="green.400"
                            borderRadius="18px"
                            p={3}
                            boxShadow={merged ? "0 0 25px rgba(34, 197, 94, 0.5)" : "md"}
                            transition="all 0.6s"
                        >
                            <VStack spacing={1}>
                                <Text fontSize="sm" color={textColor} fontWeight="medium" textAlign="center">
                                    what is a vector database
                                </Text>
                                <AnimatePresence>
                                    {merged && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <HStack spacing={1}>
                                                <Icon as={Sparkles} color="green.500" boxSize={3} />
                                                <Text fontSize="xs" color="green.600" fontWeight="semibold">
                                                    enrichie
                                                </Text>
                                            </HStack>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </VStack>
                        </Box>
                    </motion.div>
                </Box>
                {contextItems.map((item, i) => {
                    const startX = Math.cos((item.angle * Math.PI) / 180) * item.distance;
                    const startY = Math.sin((item.angle * Math.PI) / 180) * item.distance;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{
                                x: startX,
                                y: startY,
                                opacity: 0,
                                scale: 1,
                            }}
                            animate={{
                                x: [startX, 0],
                                y: [startY, 0],
                                opacity: [0, 1, 1, 0],
                                scale: [0.8, 1, 0.8, 0.2],
                            }}
                            transition={{
                                duration: 1.8,
                                delay: i * 0.2,
                                ease: "easeInOut",
                            }}
                            style={{
                                position: "absolute",
                                top: "40%",
                                left: "30%",
                                transform: "translate(-50%, -50%)",
                                zIndex: 10,
                            }}
                        >
                            <Box
                                px={3}
                                py={2}
                                bg={item.color}
                                borderRadius="18px"
                                fontSize="xs"
                                fontWeight="semibold"
                                color="white"
                                whiteSpace="nowrap"
                                boxShadow="md"
                            >
                                {item.label}
                            </Box>
                        </motion.div>
                    );
                })}
            </Box>
        </motion.div>
    );
};

const PipelineTriggerStep = () => {
    const particles = Array.from({ length: 12 });
    const bgColor = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.600", "grey.400");

    const pipelineSteps = [
        { label: "Récupération", color: "green.400" },
        { label: "Classement", color: "green.400" },
        { label: "Génération", color: "green.400" },
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
                position: "relative",
            }}
        >
            <HStack mb={6}>
                <Icon as={Zap} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Pipeline Trigger
                </Text>
            </HStack>

            <HStack spacing={4} w="85%" justify="center" align="center">
                <motion.div animate={{ opacity: [1, 0.4] }} transition={{ duration: 2 }}>
                    <Box
                        w="120px"
                        bg={bgColor}
                        border="2px solid"
                        borderColor="green.300"
                        borderRadius="18px"
                        p={2}
                        boxShadow="sm"
                    >
                        <Text fontSize="xs" color={textColor} textAlign="center">
                            what is a vector database
                        </Text>
                        <HStack spacing={1} justify="center">
                            <Icon as={Sparkles} color="green.500" boxSize={3} />
                            <Text fontSize="xs" color="green.600" fontWeight="semibold">
                                enrichie
                            </Text>
                        </HStack>
                    </Box>
                </motion.div>
                <Box position="relative">
                    {particles.map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                x: -20,
                                y: 0,
                                opacity: 0,
                                scale: 0,
                            }}
                            animate={{
                                x: [-50, 40 + i * 5],
                                y: [0, Math.sin(i) * 15],
                                opacity: [0, 0.8, 0.4, 0],
                                scale: [0, 1, 0.8, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                delay: i * 0.1,
                                ease: "easeOut",
                                repeat: Infinity,
                                repeatDelay: 0.5,
                            }}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "100%",
                            }}
                        >
                            <Box
                                w="6px"
                                h="6px"
                                bg="green.400"
                                borderRadius="999px"
                                boxShadow="0 0 10px rgba(92, 251, 60, 0.6)"
                            />
                        </motion.div>
                    ))}
                </Box>
                <VStack spacing={1} align="start">
                    {pipelineSteps.map((step, index) => (
                        <motion.div
                            key={step.label}
                            initial={{ opacity: 0, x: -20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                                delay: 0.5 + index * 0.3,
                                duration: 0.4,
                            }}
                        >
                            <HStack spacing={2} px={3} py={1} bg={step.color} borderRadius="full" boxShadow="sm">
                                <Box w="4px" h="4px" bg="white" borderRadius="999px" />
                                <Text fontSize="xs" color="white" fontWeight="semibold">
                                    {step.label}
                                </Text>
                            </HStack>
                        </motion.div>
                    ))}
                </VStack>
            </HStack>
        </motion.div>
    );
};

export default QueryOverviewTab;
