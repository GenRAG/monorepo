import { Task, TaskParam } from "lib/type/task";
import { AppNodeData } from "lib/type/app-node";
import { useState } from "react";
import { Button, Grid, Textarea, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { Flex, Text, VStack, Box, HStack, Icon } from "@chakra-ui/react";
import { FileText, ArrowRight, Database, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import MenuDropDown from "components/Atoms/MenuDropDown";
import { useNavigate } from "react-router-dom";
import Banner from "components/Atoms/Banner";

const QueryNodeModal = ({ task, nodeData }: { task: Task, nodeData: AppNodeData }) => {

    const [selectedTab, setSelectedTab] = useState<string>("Overview");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const labelColor = useColorModeValue("grey.600", "grey.400");

    return (
        <>
            <Flex
                px={4}
                pt={3}
                borderBottom="1px solid"
                borderColor={borderColor}
                gap={4}
            >
                {["Overview", "Settings"].map((tab, idx) => (
                    <Text
                        key={tab}
                        fontSize="sm"
                        fontWeight={idx === 1 ? "semibold" : "normal"}
                        color={selectedTab === tab ? "green.500" : labelColor}
                        pb={2}
                        cursor="pointer"
                        _hover={{ color: "inherit" }}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </Text>
                ))}
            </Flex>
            {selectedTab === "Settings" && <SettingsTab task={task} nodeData={nodeData} />}
            {selectedTab === "Overview" && <OverviewTab />}
        </>
    )
}

const SettingsTab = ({ task, nodeData }: { task: Task, nodeData: AppNodeData }) => {

    const { control, watch, reset } = useForm({
        defaultValues: nodeData || {},
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (nodeData) {
            reset(nodeData);
        }
    }, [nodeData, reset]);

    const labelColor = useColorModeValue("grey.600", "grey.200");

    const { colorMode } = useColorMode();

    const getOptionsForParam = (param: TaskParam): string[] => {
        switch (param.type) {
            case "STRING":
                return ["Option 1", "Option 2", "Option 3"];
            default:
                return ["CustomerDB", "ProductDB", "UserDB"];
        }
    };

    const renderParamInput = (param: TaskParam) => {
        const options = getOptionsForParam(param);
        const fieldName = param.name;
        const currentValue = watch(fieldName) || nodeData?.[fieldName];

        switch (param.type) {
            case "STRING":
                return (
                    <Controller
                        name={fieldName}
                        control={control}
                        rules={{
                            required: `Please select ${param.name}`,
                        }}
                        render={({ field }) => (
                            <MenuDropDown
                                w="100%"
                                p="0"
                                m="0"
                                label={field.value || `Select ${param.name}`}
                                variant={colorMode === 'dark' ? 'primary' : 'secondary'}
                            >
                                {options.map((option) => (
                                    <Button
                                        key={option}
                                        w="100%"
                                        borderRadius="0px"
                                        textAlign="left"
                                        alignContent="center"
                                        variant={colorMode === 'dark' ? 'primary' : 'secondary'}
                                        border="none"
                                        color={colorMode === 'dark' ? 'grey.300' : 'grey.700'}
                                        justifyContent="flex-start"
                                        onClick={() => field.onChange(option)}
                                        _hover={{ bg: colorMode === 'dark' ? 'grey.700' : 'grey.100' }}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </MenuDropDown>
                        )}
                    />
                );
            case "NUMBER":
                return (
                    <Text fontSize="sm" fontWeight="medium">
                        {currentValue || "0.022"}
                    </Text>
                );
            default:
                return (
                    <Controller
                        name={fieldName}
                        control={control}
                        render={({ field }) => (
                            <MenuDropDown
                                w="100%"
                                p="0"
                                m="0"
                                label={field.value || `Select ${param.name}`}
                                variant={colorMode === 'dark' ? 'primary' : 'secondary'}
                            >
                                {options.map((option) => (
                                    <Button
                                        key={option}
                                        w="100%"
                                        borderRadius="0px"
                                        textAlign="left"
                                        alignContent="center"
                                        variant={colorMode === 'dark' ? 'primary' : 'secondary'}
                                        border="none"
                                        color={colorMode === 'dark' ? 'grey.300' : 'grey.700'}
                                        justifyContent="flex-start"
                                        onClick={() => field.onChange(option)}
                                        _hover={{ bg: colorMode === 'dark' ? 'grey.700' : 'grey.100' }}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </MenuDropDown>
                        )}
                    />
                );
        }
    };

    return (
        <VStack
            flex={1}
            p={4}
            spacing={4}
            align="stretch"
            overflowY="auto"
        >
            <Box>
                <HStack justify="space-between" mb={2}>
                    <Text fontSize="md" fontWeight="semibold">
                        Actual Settings
                    </Text>
                </HStack>
                <VStack spacing={2} align="stretch">
                    <Text fontSize="sm" color={labelColor}>
                        <strong>Type:</strong> Vector Store
                    </Text>
                    <Text fontSize="sm" color={labelColor}>
                        <strong>Provider:</strong> Qdrant
                    </Text>
                    <Text fontSize="sm" color={labelColor}>
                        <strong>Documents:</strong> 120
                    </Text>
                </VStack>
            </Box>
            {/*task.inputs && task.inputs.length > 0 && (
                <Box>
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="semibold">
                            Parameters
                        </Text>
                        <Tag size="sm" colorScheme="green" variant="subtle">
                            float
                        </Tag>
                    </HStack>
                    <VStack spacing={2} align="stretch">
                        {task.inputs.filter(input => input.type === "NUMBER").map((param) => (
                            <Flex key={param.name} justify="space-between" align="center">
                                <Text fontSize="sm" color={labelColor}>
                                    {param.name}
                                </Text>
                                {renderParamInput(param)}
                            </Flex>
                        ))}
                    </VStack>
                </Box>
            )*/}

            {/*<Divider />
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={2}>
                        Inputs
                    </Text>
                    <VStack spacing={3} align="stretch">
                        <Box>
                            <Text fontSize="xs" color="green.500" mb={1}>
                                {input.name}
                            </Text>
                            {renderParamInput(input)}
                        </Box>
                    </VStack>
                </Box>

            <Divider />
            {task.outputs && task.outputs.length > 0 && (
                <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={2}>
                        Outputs
                    </Text>
                    <VStack spacing={3} align="stretch">
                        {task.outputs.map((output) => (
                            <Box key={output.name}>
                                <Text fontSize="xs" color="green.500" mb={1}>
                                    {output.name}
                                </Text>
                                {renderParamInput(output)}
                            </Box>
                        ))}
                    </VStack>
                </Box>
            )}

            <Divider />
            <Flex justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="semibold">
                    Complexity Level
                </Text>
                <Tag size="sm" colorScheme="green" variant="subtle">
                    Low
                </Tag>
            </Flex>

            <Divider />
            */}
            <Banner variant="green" mb="16px" flexShrink={0} gap="0">
                <HStack>
                    <Text fontSize="sm" color="grey.900">
                        You can manage your settings
                    </Text>
                    <Text fontSize="sm" _hover={{ textDecoration: 'underline' }} onClick={() => { navigate('/workspace/12342/documents') }} cursor="pointer" color="green.500">here</Text>
                </HStack>
            </Banner>
            <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    Notes
                </Text>
                <Textarea
                    borderRadius="12px"
                    size="sm"
                    placeholder="Add notes..."
                    rows={3}
                    resize="vertical"
                    defaultValue="Plan for migrating data dependencies, including file-to-database connections and API calls to ensure seamless data access in the new environment."
                />
            </Box>
        </VStack>
    )
}

export const OverviewTab = () => {
    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const { colorMode } = useColorMode();

    return (
        <VStack
            flex={1}
            p={4}
            spacing={6}
            align="stretch"
            overflowY="auto"
        >
            {/* Header */}
            <Box>
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    mb={2}
                    color={colorMode === "dark" ? "grey.100" : "grey.900"}
                >
                    How Does a User Query Enter the System?
                </Text>

                <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "grey.400" : "grey.600"}
                >
                    The query is the starting point of the entire GenRAG workflow.
                </Text>

                <Text
                    fontSize="sm"
                    mt={2}
                    color={colorMode === "dark" ? "grey.400" : "grey.600"}
                >
                    <strong>Ask a question.</strong> We propagate it through the pipeline.
                </Text>
            </Box>

            {/* Animation */}
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

            {/* Steps */}
            <VStack spacing={3} align="stretch">
                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.400" />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "grey.100" : "grey.900"}
                        >
                            1. User Input
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        The user writes a natural language question or instruction.
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
                            2. Query Normalization
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        The query is cleaned and formatted to be understood by the system.
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
                            3. Context Injection
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        System instructions and metadata are attached to guide retrieval.
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
                            4. Pipeline Trigger
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        The query is sent downstream to retrieval, ranking, and generation.
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};


import { MessageSquare, User, Send, Sparkles, WandSparkles, Zap } from "lucide-react";

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
                return prev + (100 / 30);
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

// Step 1: User Input - Typing natural language question
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

            <Box
                w="85%"
                bg={bgColor}
                border="2px solid"
                borderColor={borderColor}
                borderRadius="48px"
                boxShadow="sm"
            >
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
    const [phase, setPhase] = useState<'initial' | 'lowercase' | 'deleting' | 'replacing' | 'complete'>('initial');
    const bgColor = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.800", "grey.200");

    useEffect(() => {
        const timer1 = setTimeout(() => setPhase('lowercase'), 400);
        const timer2 = setTimeout(() => setPhase('deleting'), 900);
        const timer3 = setTimeout(() => setPhase('replacing'), 1400);
        const timer4 = setTimeout(() => setPhase('complete'), 2000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, []);

    const isLowercase = phase !== 'initial';
    const isDeleting = phase === 'deleting';
    const isReplacing = phase === 'replacing' || phase === 'complete';

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
                                {isLowercase ? 'what' : 'What'}
                            </Text>
                        </motion.div>
                    </Box>

                    <Text fontSize="sm" color={textColor}>is</Text>
                    <Text fontSize="sm" color={textColor}>a</Text>
                    <Text fontSize="sm" color={textColor}>vector</Text>
                    <Box position="relative" display="inline-block" minW="70px">
                        <motion.div
                            animate={{
                                opacity: isReplacing ? 0 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                            style={{ position: "relative", display: "inline-block" }}
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
                                    damping: 20
                                }}
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <Box position="relative" display="inline-block">
                                    <Text
                                        fontSize="sm"
                                        color="green.500"
                                        fontWeight="semibold"
                                        display="inline"
                                    >
                                        database
                                    </Text>
                                    {phase === 'replacing' && (
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
    const enrichedBg = useColorModeValue("green.50", "green.900");

    const contextItems = [
        { id: 1, label: "System Instructions", color: "green.400", angle: -120, distance: 100 },
        { id: 2, label: "User Context", color: "green.500", angle: 180, distance: 90 },
        { id: 3, label: "Metadata", color: "green.300", angle: 120, distance: 95 },
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
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    w="200px"
                    zIndex={2}
                >
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
                            bg={merged ? enrichedBg : bgColor}
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
                                                    enriched
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
        { label: "Retrieval", color: "green.400" },
        { label: "Ranking", color: "green.400" },
        { label: "Generation", color: "green.400" },
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
                <motion.div
                    animate={{ opacity: [1, 0.4] }}
                    transition={{ duration: 2 }}
                >
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
                                enriched
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
                                x: [- 50, 40 + i * 5],
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
                            <HStack
                                spacing={2}
                                px={3}
                                py={1}
                                bg={step.color}
                                borderRadius="full"
                                boxShadow="sm"
                            >
                                <Box
                                    w="4px"
                                    h="4px"
                                    bg="white"
                                    borderRadius="999px"
                                />
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

export default QueryNodeModal;