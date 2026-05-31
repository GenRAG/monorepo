import { useEffect, useState } from "react";
import { useColorMode, useColorModeValue } from "@chakra-ui/react";
import { Flex, Text, VStack, Box, HStack, Icon } from "@chakra-ui/react";
import { PencilLine, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppNodeData, Task } from "@genrag/workflow";
import { NodeSettingsEditor } from "pages/Agents/Workflow/NodeModalContent/NodeSettingsEditor";

interface RewriterNodeModalProps {
    task: Task;
    nodeData: AppNodeData;
    mainNodeId: string;
    onSettingSelect: (nodeId: string, item: string) => void;
}

const RewriterNodeModal = ({ mainNodeId, onSettingSelect }: RewriterNodeModalProps) => {
    const [selectedTab, setSelectedTab] = useState<string>("Overview");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const labelColor = useColorModeValue("grey.600", "grey.400");

    return (
        <>
            <Flex px={4} pt={3} borderBottom="1px solid" borderColor={borderColor} gap={4}>
                {["Overview", "Settings"].map((tab) => (
                    <Text
                        key={tab}
                        fontSize="sm"
                        fontWeight="normal"
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
                <VStack flex={1} p={4} spacing={4} align="stretch" overflowY="auto">
                    <NodeSettingsEditor mainNodeId={mainNodeId} onSettingSelect={onSettingSelect} />
                </VStack>
            )}
            {selectedTab === "Overview" && <RewriterOverviewTab />}
        </>
    );
};

const RewriterOverviewTab = () => {
    const { colorMode } = useColorMode();
    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("grey.200", "grey.700");

    return (
        <VStack flex={1} p={4} spacing={6} align="stretch" overflowY="auto">
            <Box>
                <Text fontSize="lg" fontWeight="bold" mb={2} color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                    Comment la requête est-elle améliorée ?
                </Text>
                <Text fontSize="sm" color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                    Le Rewriter reformule la question de l'utilisateur pour mieux correspondre aux documents indexés.
                </Text>
                <Text fontSize="sm" mt={2} color={colorMode === "dark" ? "grey.400" : "grey.600"}>
                    <strong>Une question vague en entrée.</strong> Une requête <strong>précise et contextualisée</strong> en sortie.
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
                <RewriterAnimation />
            </Box>

            <VStack spacing={3} align="stretch">
                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.400" />
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                            1. Analyse de la question
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        Le modèle LLM analyse l'intention derrière la question de l'utilisateur.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.500" />
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                            2. Reformulation
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        La question est réécrite avec les termes les plus susceptibles de matcher vos documents.
                    </Text>
                </Box>

                <Box>
                    <HStack spacing={2} mb={1}>
                        <Box w="8px" h="8px" borderRadius="999px" bg="green.600" />
                        <Text fontSize="sm" fontWeight="semibold" color={colorMode === "dark" ? "grey.100" : "grey.900"}>
                            3. Meilleure récupération
                        </Text>
                    </HStack>
                    <Text fontSize="xs" color={colorMode === "dark" ? "grey.400" : "grey.600"} pl={5}>
                        La requête reformulée améliore la pertinence des documents récupérés par le retriever.
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
};

const STEPS = [
    { original: "Dites-moi sur la politique RH", rewritten: "Quelle est la politique de ressources humaines concernant les congés et avantages ?" },
    { original: "C'est quoi les prix ?", rewritten: "Quels sont les tarifs et grilles tarifaires disponibles pour les offres ?" },
    { original: "Comment ça marche ?", rewritten: "Quel est le fonctionnement détaillé du processus décrit dans la documentation ?" },
];

const RewriterAnimation = () => {
    const [stepIdx, setStepIdx] = useState(0);
    const [phase, setPhase] = useState<"original" | "rewriting" | "rewritten">("original");
    const { colorMode } = useColorMode();
    const cardBg = useColorModeValue("white", "grey.800");
    const textColor = useColorModeValue("grey.800", "grey.200");

    useEffect(() => {
        const t1 = setTimeout(() => setPhase("rewriting"), 1000);
        const t2 = setTimeout(() => setPhase("rewritten"), 2200);
        const t3 = setTimeout(() => {
            setPhase("original");
            setStepIdx((i) => (i + 1) % STEPS.length);
        }, 3800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [stepIdx]);

    const step = STEPS[stepIdx];

    return (
        <Box w="100%" h="100%" display="flex" flexDir="column" alignItems="center" justifyContent="center" gap={4} px={4}>
            <HStack spacing={2} mb={2}>
                <Icon as={PencilLine} color="green.500" boxSize={4} />
                <Text fontSize="sm" fontWeight="semibold" color="green.500">
                    {phase === "original" ? "Requête originale" : phase === "rewriting" ? "Reformulation..." : "Requête optimisée"}
                </Text>
            </HStack>

            <Box w="100%" position="relative" minH="90px">
                <AnimatePresence mode="wait">
                    {phase === "original" && (
                        <motion.div key="original" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                            <Box bg={cardBg} border="1.5px solid" borderColor={useColorModeValue("grey.200", "grey.600")} borderRadius="12px" p={3}>
                                <Text fontSize="13px" color={textColor} fontStyle="italic">"{step.original}"</Text>
                            </Box>
                        </motion.div>
                    )}
                    {phase === "rewriting" && (
                        <motion.div key="rewriting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Box bg={cardBg} border="1.5px dashed" borderColor="green.400" borderRadius="12px" p={3}>
                                <HStack spacing={2}>
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                        <Icon as={Sparkles} color="green.500" boxSize={4} />
                                    </motion.div>
                                    <Box flex={1} h="10px" bg="green.100" borderRadius="999px" overflow="hidden">
                                        <motion.div style={{ height: "100%", background: "var(--chakra-colors-green-400)", borderRadius: "999px" }} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: "easeInOut" }} />
                                    </Box>
                                </HStack>
                            </Box>
                        </motion.div>
                    )}
                    {phase === "rewritten" && (
                        <motion.div key="rewritten" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                            <Box bg={cardBg} border="1.5px solid" borderColor="green.400" borderRadius="12px" p={3} boxShadow="0 0 12px rgba(52,211,153,0.2)">
                                <HStack align="start" spacing={2}>
                                    <Icon as={CheckCircle2} color="green.500" boxSize={4} mt={0.5} flexShrink={0} />
                                    <Text fontSize="13px" color={textColor}>"{step.rewritten}"</Text>
                                </HStack>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            <Box position="absolute" bottom={0} left={0} right={0} h="4px" bg={colorMode === "dark" ? "grey.700" : "grey.100"} overflow="hidden">
                <motion.div
                    key={stepIdx}
                    style={{ height: "100%", background: "var(--chakra-colors-green-500)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.8, ease: "linear" }}
                />
            </Box>
        </Box>
    );
};

export default RewriterNodeModal;
