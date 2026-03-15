import { Task, TaskParam } from "lib/type/task";
import { AppNodeData } from "lib/type/app-node";
import { useState } from "react";
import {
    Button,
    Grid,
    Textarea,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { Flex, Text, VStack, Box, HStack, Icon } from "@chakra-ui/react";
import { FileText, ArrowRight, Database, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import MenuDropDown from "components/Atoms/MenuDropDown";
import { useNavigate, useParams } from "react-router-dom";
import Banner from "components/Atoms/Banner";

const DatabaseNodeModal = ({
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
    task,
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
                        color="blue.500"
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
                    How Do We Handle Your Documents?
                </Text>
                <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "grey.400" : "grey.600"}
                >
                    We transform and store documents as searchable vectors for
                    AI-powered retrieval
                </Text>
                <Text
                    fontSize="sm"
                    mt={2}
                    color={colorMode === "dark" ? "grey.400" : "grey.600"}
                >
                    <strong>Upload</strong> your documents. We take care of{" "}
                    <strong>everything else</strong>.
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
                <DocumentDatabaseAnimation />
            </Box>

            <VStack spacing={3} align="stretch">
                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="green.400"
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            1. Document Ingestion
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        You can upload and process various document formats
                        (PDF, TXT, DOCX)
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="green.500"
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            2. Vectorization
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        We convert text into numerical vectors using AI
                        embeddings
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="green.600"
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            3. Vector Storage
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        We store vectors in an optimized database for fast
                        retrieval
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="green.700"
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={
                                colorMode === "dark" ? "grey.100" : "grey.900"
                            }
                        >
                            4. Semantic Search
                        </Text>
                    </HStack>
                    <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "grey.400" : "grey.600"}
                        pl={5}
                    >
                        We find similar documents based on meaning, not just
                        keywords
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

export const DocumentDatabaseAnimation = () => {
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setProgress(0);
        setIsInitialized(false);

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
                {step === 0 && <DocumentIngestionStep key="step-0" />}
                {step === 1 && <VectorizationStep key="step-1" />}
                {step === 2 && <VectorStorageStep key="step-2" />}
                {step === 3 && <SemanticSearchStep key="step-3" />}
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

const DocumentIngestionStep = () => {
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
                <Icon as={FileText} color="green.400" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.400">
                    1. Document Ingestion
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
                            bg={colorMode === "dark" ? "grey.800" : "white"}
                            border="2px solid"
                            borderColor={
                                colorMode === "dark" ? "green.300" : "green.200"
                            }
                            borderRadius="8px"
                            justify="center"
                            boxShadow="md"
                        >
                            <Icon
                                as={FileText}
                                color={
                                    colorMode === "dark"
                                        ? "green.400"
                                        : "green.500"
                                }
                                boxSize={6}
                            />
                            <Box w="70%" h="2px" bg="grey.300" />
                            <Box w="70%" h="2px" bg="grey.300" />
                            <Box w="50%" h="2px" bg="grey.300" />
                        </VStack>
                    </motion.div>
                ))}
            </HStack>
        </motion.div>
    );
};

const VectorizationStep = () => {
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
                <Icon as={ArrowRight} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    2. Vectorization
                </Text>
            </HStack>
            <Flex gap={8} align="center">
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

                <Grid templateColumns="repeat(5, 1fr)" gap={2}>
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
                            <Box
                                w="8px"
                                h="8px"
                                bg="green.500"
                                borderRadius="999px"
                            />
                        </motion.div>
                    ))}
                </Grid>
            </Flex>
        </motion.div>
    );
};

const VectorStorageStep = () => {
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
                <Icon as={Database} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    3. Vector Storage
                </Text>
            </HStack>
            <Grid templateColumns="repeat(6, 1fr)" gap={3}>
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
            </Grid>
        </motion.div>
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
                <Icon as={Search} color="green.700" boxSize={5} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    4. Semantic Search
                </Text>
            </HStack>
            <Box position="relative">
                <Grid templateColumns="repeat(6, 1fr)" gap={3}>
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
                                bg={
                                    highlighted.includes(i)
                                        ? "green.400"
                                        : "grey.400"
                                }
                                borderRadius="8px"
                            />
                        </motion.div>
                    ))}
                </Grid>

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
                    <Icon
                        as={Search}
                        boxSize={10}
                        color="green.400"
                        strokeWidth={2}
                    />
                </motion.div>
            </Box>
        </motion.div>
    );
};

export default DatabaseNodeModal;
