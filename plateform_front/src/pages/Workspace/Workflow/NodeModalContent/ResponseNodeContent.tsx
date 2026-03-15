import { useState } from "react";
import {
    Button,
    Tag,
    Textarea,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { Flex, Text, VStack, Box, HStack, Icon } from "@chakra-ui/react";
import { BookOpen, ExternalLink, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import MenuDropDown from "components/Atoms/MenuDropDown";
import { useNavigate, useParams } from "react-router-dom";
import Banner from "components/Atoms/Banner";

import type { Task, TaskParam, AppNodeData } from "@genrag/workflow";

const ResponseNodeModal = ({
    task,
    nodeData,
}: {
    task: Task;
    nodeData: AppNodeData;
}) => {
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
            {selectedTab === "Settings" && (
                <SettingsTab task={task} nodeData={nodeData} />
            )}
            {selectedTab === "Overview" && <OverviewTab />}
        </>
    );
};

const SettingsTab = ({
    nodeData,
}: {
    task: Task;
    nodeData: AppNodeData;
}) => {
    const { control, watch, reset } = useForm({
        defaultValues: nodeData || {},
    });

    const navigate = useNavigate();
    const { workspaceId, agentId } = useParams<{
        workspaceId: string;
        agentId: string;
    }>();

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
                                variant={
                                    colorMode === "dark"
                                        ? "primary"
                                        : "secondary"
                                }
                            >
                                {options.map((option) => (
                                    <Button
                                        key={option}
                                        w="100%"
                                        borderRadius="0px"
                                        textAlign="left"
                                        alignContent="center"
                                        variant={
                                            colorMode === "dark"
                                                ? "primary"
                                                : "secondary"
                                        }
                                        border="none"
                                        color={
                                            colorMode === "dark"
                                                ? "grey.300"
                                                : "grey.700"
                                        }
                                        justifyContent="flex-start"
                                        onClick={() => field.onChange(option)}
                                        _hover={{
                                            bg:
                                                colorMode === "dark"
                                                    ? "grey.700"
                                                    : "grey.100",
                                        }}
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
                                variant={
                                    colorMode === "dark"
                                        ? "primary"
                                        : "secondary"
                                }
                            >
                                {options.map((option) => (
                                    <Button
                                        key={option}
                                        w="100%"
                                        borderRadius="0px"
                                        textAlign="left"
                                        alignContent="center"
                                        variant={
                                            colorMode === "dark"
                                                ? "primary"
                                                : "secondary"
                                        }
                                        border="none"
                                        color={
                                            colorMode === "dark"
                                                ? "grey.300"
                                                : "grey.700"
                                        }
                                        justifyContent="flex-start"
                                        onClick={() => field.onChange(option)}
                                        _hover={{
                                            bg:
                                                colorMode === "dark"
                                                    ? "grey.700"
                                                    : "grey.100",
                                        }}
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
        <VStack flex={1} p={4} spacing={4} align="stretch" overflowY="auto">
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
                    <Text
                        fontSize="sm"
                        _hover={{ textDecoration: "underline" }}
                        onClick={async () => {
                            await navigate(
                                workspaceId && agentId
                                    ? `/workspaces/${workspaceId}/agents/${agentId}/documents`
                                    : "#",
                            );
                        }}
                        cursor="pointer"
                        color="green.500"
                    >
                        here
                    </Text>
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
    );
};

export const OverviewTab = () => {
    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const { colorMode } = useColorMode();

    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    mb={2}
                    color={colorMode === "dark" ? "grey.100" : "grey.900"}
                >
                    How Is the Final Answer Generated?
                </Text>

                <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "grey.400" : "grey.600"}
                >
                    We generate a clear and reliable response by combining your
                    query with the most relevant documents.
                </Text>

                <Text
                    fontSize="sm"
                    mt={2}
                    color={colorMode === "dark" ? "grey.400" : "grey.600"}
                >
                    The response is <strong>context-aware</strong>,{" "}
                    <strong>ranked</strong>, and ready to be used.
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
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="999px"
                            bg="green.400"
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            1. Context Aggregation
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        Relevant documents and signals from the workflow are
                        gathered and prepared.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="999px"
                            bg="green.500"
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            2. Answer Generation
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        The language model generates a response grounded in the
                        retrieved context.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="999px"
                            bg="green.600"
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            3. Response Refinement
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        The answer is refined to ensure clarity, relevance, and
                        consistency.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="999px"
                            bg="green.700"
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            4. Final Output
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        The final response is delivered with the sources used to
                        generate it.
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

import { FileText, Sparkles, Check, Copy } from "lucide-react";

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

const AggregationStep = () => {
    const sources = [
        {
            id: 1,
            label: "Query",
            color: "green.400",
            angle: -60,
            distance: 120,
        },
        {
            id: 2,
            label: "Doc 1",
            color: "green.400",
            angle: -120,
            distance: 100,
        },
        {
            id: 3,
            label: "Doc 2",
            color: "green.400",
            angle: 180,
            distance: 110,
        },
        {
            id: 4,
            label: "Ranking",
            color: "green.400",
            angle: 60,
            distance: 100,
        },
    ];

    const bgColor = useColorModeValue("white", "grey.800");

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
            <HStack mb={6} mt={10}>
                <Icon as={Sparkles} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Aggregating...
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
                    bg={bgColor}
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
                    const startX =
                        Math.cos((source.angle * Math.PI) / 180) *
                        source.distance;
                    const startY =
                        Math.sin((source.angle * Math.PI) / 180) *
                        source.distance;

                    return (
                        <motion.div
                            key={source.id}
                            initial={{
                                x: startX,
                                y: startY,
                                opacity: 0,
                                scale: 1,
                            }}
                            animate={{
                                x: 0,
                                y: 0,
                                opacity: [0, 1, 0.8, 0],
                                scale: [1, 1, 0.5, 0],
                            }}
                            transition={{
                                duration: 2,
                                delay: i * 0.2,
                                ease: "easeInOut",
                            }}
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
        </motion.div>
    );
};

const GenerationStep = () => {
    const [displayedText, setDisplayedText] = useState("");
    const fullText =
        "A vector database stores embeddings for\n semantic search and retrieval.";
    const lines = fullText.split("\n");

    const bgColor = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.800", "grey.200");
    const borderColor = useColorModeValue("green.300", "green.600");

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
                <Icon as={FileText} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Generating...
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
                minH="85px"
            >
                <VStack align="start" spacing={1}>
                    {displayedLines.map((line, lineIndex) => (
                        <HStack key={lineIndex} spacing={0} align="start">
                            <Text
                                fontSize="sm"
                                color={textColor}
                                lineHeight="1.6"
                            >
                                {line}
                            </Text>
                            {lineIndex === displayedLines.length - 1 && (
                                <motion.div
                                    animate={{
                                        opacity: [1, 1, 0, 0],
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    style={{
                                        width: "2px",
                                        height: "16px",
                                        backgroundColor: "#805AD5",
                                        borderRadius: "1px",
                                        marginLeft: "2px",
                                        marginTop: "2px",
                                    }}
                                />
                            )}
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </motion.div>
    );
};

const RefinementStep = () => {
    const [phase, setPhase] = useState<
        "initial" | "refining1" | "refining2" | "refining3" | "complete"
    >("initial");
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

    const isRefined1 = phase !== "initial";
    const isRefined2 = phase !== "initial" && phase !== "refining1";
    const isRefined3 = phase === "refining3" || phase === "complete";

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
                <Icon as={Sparkles} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Refining...
                </Text>
            </HStack>

            <Box
                w="85%"
                bg={bgColor}
                border="2px solid"
                borderColor="green.400"
                borderRadius="24px"
                p={4}
                minH="85px"
                boxShadow={
                    phase === "complete"
                        ? "0 0 20px rgba(34, 197, 94, 0.4)"
                        : "md"
                }
                position="relative"
            >
                <Text fontSize="sm" color={textColor} lineHeight="1.8">
                    A vector database{" "}
                    {/* "stores" → "efficiently stores high-dimensional" */}
                    <Box
                        as="span"
                        position="relative"
                        display="inline-block"
                        style={{ minWidth: isRefined1 ? "230px" : "auto" }}
                    >
                        {!isRefined1 && (
                            <motion.span style={{ position: "relative" }}>
                                stores
                                {phase === ("refining1" as typeof phase) && (
                                    <motion.span
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: 0,
                                            height: "2px",
                                            backgroundColor: "#EF4444",
                                            display: "block",
                                        }}
                                    />
                                )}
                            </motion.span>
                        )}
                        {isRefined1 && (
                            <motion.span
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                }}
                                style={{
                                    color: "#34D3A9",
                                    fontWeight: 600,
                                }}
                            >
                                efficiently stores high-dimensional
                            </motion.span>
                        )}
                    </Box>{" "}
                    embeddings{isRefined1 && ","} enabling{" "}
                    <Box
                        as="span"
                        position="relative"
                        display="inline-block"
                        style={{ minWidth: isRefined2 ? "160px" : "auto" }}
                    >
                        {!isRefined2 && (
                            <motion.span
                                style={{
                                    position: "relative",
                                    marginRight: "4px",
                                }}
                            >
                                semantic search and{" "}
                                {phase === ("refining2" as typeof phase) && (
                                    <motion.span
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: 0,
                                            height: "2px",
                                            backgroundColor: "#EF4444",
                                            display: "block",
                                        }}
                                    />
                                )}
                            </motion.span>
                        )}
                        {isRefined2 && (
                            <HStack>
                                <motion.span
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                    }}
                                    style={{
                                        color: "#34D3A9",
                                        fontWeight: 600,
                                    }}
                                >
                                    fast semantic search
                                </motion.span>
                                <Text
                                    fontSize="sm"
                                    color={textColor}
                                    mr="4px"
                                    lineHeight="1.8"
                                >
                                    and
                                </Text>
                            </HStack>
                        )}
                    </Box>
                    <Box
                        as="span"
                        position="relative"
                        display="inline-block"
                        style={{ minWidth: isRefined3 ? "150px" : "auto" }}
                    >
                        {!isRefined3 && (
                            <motion.span style={{ position: "relative" }}>
                                {" "}
                                retrieval.
                                {phase === ("refining3" as typeof phase) && (
                                    <motion.span
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: 0,
                                            height: "2px",
                                            backgroundColor: "#EF4444",
                                            display: "block",
                                        }}
                                    />
                                )}
                            </motion.span>
                        )}
                        {isRefined3 && (
                            <motion.span
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                }}
                                style={{
                                    color: "#34D3A9",
                                    fontWeight: 600,
                                }}
                            >
                                intelligent retrieval.
                            </motion.span>
                        )}
                    </Box>
                </Text>
                <AnimatePresence>
                    {phase === "complete" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                            }}
                            style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                            }}
                        >
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

    const sources = [{ id: 1, title: "Vector DB Guide" }];

    useEffect(() => {
        const timer = setTimeout(() => {
            setSourcesVisible(true);
        }, 500);
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
            <HStack mb={2}>
                <Icon as={Link2} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    Sources Available
                </Text>
            </HStack>

            <VStack w="90%" spacing={3} align="stretch">
                <Box
                    w="100%"
                    bg={bgColor}
                    border="2px solid"
                    borderColor="green.300"
                    borderRadius="24px"
                    p={4}
                    boxShadow="md"
                >
                    <VStack align="start" spacing={1}>
                        <HStack spacing={1} align="baseline">
                            <Text
                                fontSize="sm"
                                color={textColor}
                                lineHeight="1.6"
                            >
                                A vector database efficiently stores
                                high-dimensional embeddings enabling
                            </Text>
                            <AnimatePresence>
                                {sourcesVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Tag
                                            size="sm"
                                            colorScheme="green"
                                            variant="solid"
                                            borderRadius="999px"
                                        >
                                            1
                                        </Tag>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </HStack>
                        <HStack spacing={1} align="baseline">
                            <Text
                                fontSize="sm"
                                color={textColor}
                                lineHeight="1.6"
                            >
                                fast semantic search and intelligent retrieval.
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
                            <VStack
                                spacing={2}
                                align="stretch"
                                p={3}
                                bg={sourcesBg}
                                borderRadius="18px"
                            >
                                <HStack spacing={2}>
                                    <Icon
                                        as={BookOpen}
                                        color="green.500"
                                        boxSize={4}
                                    />
                                    <Text
                                        fontSize="xs"
                                        fontWeight="semibold"
                                        color="green.600"
                                    >
                                        Referenced Sources
                                    </Text>
                                </HStack>

                                {sources.map((source, index) => (
                                    <motion.div
                                        key={source.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 1 + index * 0.1,
                                            duration: 0.3,
                                        }}
                                    >
                                        <HStack spacing={2}>
                                            <Tag
                                                size="sm"
                                                colorScheme="green"
                                                variant="solid"
                                                borderRadius="999px"
                                            >
                                                {source.id}
                                            </Tag>
                                            <Text
                                                fontSize="xs"
                                                color={textColor}
                                            >
                                                {source.title}
                                            </Text>
                                            <Icon
                                                as={ExternalLink}
                                                color="green.400"
                                                boxSize={3}
                                                ml="auto"
                                            />
                                        </HStack>
                                    </motion.div>
                                ))}
                            </VStack>
                        </motion.div>
                    )}
                </AnimatePresence>
            </VStack>
        </motion.div>
    );
};

export default ResponseNodeModal;
