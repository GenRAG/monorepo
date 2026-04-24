import {
    Flex,
    HStack,
    IconButton,
    Text,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DatabaseNodeModal from "pages/Agents//Workflow/NodeModalContent/DocumentNodeContent";
import RerankerNodeModal from "pages/Agents/Workflow/NodeModalContent/ReRankerNodeContent";
import QueryNodeModal from "pages/Agents/Workflow/NodeModalContent/QueryNodeContent";
import ResponseNodeModal from "pages/Agents/Workflow/NodeModalContent/ResponseNodeContent";
import SettingPlaceholderContent from "pages/Agents/Workflow/NodeModalContent/SettingPlaceholderContent";
import { NodeShape } from "@genrag/workflow";

import { Task, TaskType } from "@genrag/workflow";

interface NodeModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    nodeData?: any;
    selectedNodeId?: string | null;
    onSettingSelect?: (nodeId: string, item: string) => void;
}

export const NodeModal = ({
    task,
    isOpen,
    onClose,
    nodeData,
    selectedNodeId,
    onSettingSelect,
}: NodeModalProps) => {
    const { fitView } = useReactFlow();

    const bgColor = useColorModeValue("white", "grey.800");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const sectionBg = useColorModeValue("green.50", "grey.900");
    const labelColor = useColorModeValue("grey.600", "grey.400");

    const handleClose = () => {
        onClose();
        setTimeout(async () => {
            await fitView({ duration: 500, minZoom: 1, maxZoom: 1 });
        }, 500);
    };

    return (
        <motion.div
            animate={{ width: isOpen && task ? "432px" : "0px" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ height: "100%", overflow: "hidden" }}
        >
            <AnimatePresence>
                {isOpen && task && (
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                            height: "100%",
                            width: "432px",
                            padding: "8px",
                        }}
                    >
                        <Flex
                            direction="column"
                            w="420px"
                            h="100%"
                            bg={bgColor}
                            boxShadow="lg"
                            borderRadius="12px"
                            border="1px solid"
                            borderColor={borderColor}
                        >
                            <Flex
                                p={4}
                                borderBottom="1px solid"
                                borderColor={borderColor}
                                borderTopRadius="12px"
                                align="center"
                                justify="space-between"
                                bg={sectionBg}
                            >
                                <HStack spacing={6}>
                                    <VStack alignItems="start" spacing={0}>
                                        <Text
                                            fontWeight="semibold"
                                            fontSize="md"
                                        >
                                            {task.label || task.type}
                                        </Text>
                                        <Text fontSize="xs" color={labelColor}>
                                            {task.description}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <HStack spacing={2}>
                                    <IconButton
                                        aria-label="Close"
                                        icon={<X size={18} />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleClose}
                                    />
                                </HStack>
                            </Flex>
                            {task.type === TaskType.RETRIEVER && (
                                <DatabaseNodeModal
                                    task={task}
                                    nodeData={nodeData}
                                />
                            )}
                            {task.type === TaskType.RERANKER && (
                                <RerankerNodeModal
                                    task={task}
                                    nodeData={nodeData}
                                />
                            )}
                            {task.type === TaskType.QUERY && (
                                <QueryNodeModal
                                    task={task}
                                    nodeData={nodeData}
                                />
                            )}
                            {task.type === TaskType.RESPONSE && (
                                <ResponseNodeModal
                                    task={task}
                                    nodeData={nodeData}
                                />
                            )}
                            {task.type === TaskType.MODEL && (
                                <SettingPlaceholderContent
                                    task={task}
                                    nodeData={nodeData}
                                    onSelect={(item) => {
                                        onSettingSelect?.(
                                            selectedNodeId ?? "",
                                            item,
                                        );
                                        onClose();
                                    }}
                                />
                            )}
                        </Flex>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
