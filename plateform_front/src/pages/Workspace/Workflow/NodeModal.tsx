import { Flex, HStack, IconButton, Text, useColorMode, useColorModeValue, VStack, Divider, Tag, Textarea, Button, Grid, Icon, Badge } from "@chakra-ui/react"
import { useReactFlow } from "@xyflow/react";
import { NodeShape } from "components/Molecules/Nodes/NodeShape";
import { Task, TaskType } from "lib/type/task";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import DatabaseNodeModal from "pages/Workspace/Workflow/NodeModalContent/DocumentNodeContent";
import RerankerNodeModal from "pages/Workspace/Workflow/NodeModalContent/ReRankerNodeContent";
import QueryNodeModal from "pages/Workspace/Workflow/NodeModalContent/QueryNodeContent";
import ResponseNodeModal from "pages/Workspace/Workflow/NodeModalContent/ResponseNodeContent";

interface NodeModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    nodeData?: any;
}

export const NodeModal = ({ task, isOpen, onClose, nodeData }: NodeModalProps) => {
    const { fitView } = useReactFlow();

    const bgColor = useColorModeValue("white", "grey.800");
    const borderColor = useColorModeValue("grey.200", "grey.700");
    const sectionBg = useColorModeValue("green.50", "grey.900");
    const { colorMode } = useColorMode();
    const labelColor = useColorModeValue("grey.600", "grey.400");

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            fitView({ duration: 500 });
        }, 500);
    }

    return (
        <motion.div
            animate={{ width: isOpen && task ? "400px" : "0px" }}
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
                        style={{ height: "100%", width: "400px" }}
                    >
                        <Flex
                            direction="column"
                            w="400px"
                            h="100%"
                            bg={bgColor}
                            borderLeft="1px solid"
                            borderColor={borderColor}
                            boxShadow="lg"
                        >
                            <Flex
                                p={4}
                                borderBottom="1px solid"
                                borderColor={borderColor}
                                align="center"
                                justify="space-between"
                                bg={sectionBg}
                            >
                                <HStack spacing={3}>
                                    <NodeShape
                                        shape={task.shape}
                                        icon={task.icon}
                                        isSelected={false}
                                        canHover={false}
                                        size={50}
                                        backgroundColor={{ light: "#F0FFF4", dark: "#2F855A" }}
                                    />
                                    <VStack alignItems="start" spacing={0}>
                                        <Text fontWeight="semibold" fontSize="lg">
                                            {task.label || task.type}
                                        </Text>
                                        <Text fontSize="xs" color={labelColor}>
                                            {task.description}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <HStack spacing={2}>
                                    <Badge colorScheme="green" color={colorMode === 'dark' ? 'green.500' : 'green.500'} variant="subtle" borderRadius="24px">
                                        Active
                                    </Badge>
                                    <IconButton
                                        aria-label="Close"
                                        icon={<X size={18} />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleClose}
                                    />
                                </HStack>
                            </Flex>
                            {task.type === TaskType.RETRIEVER && <DatabaseNodeModal task={task} nodeData={nodeData} />}
                            {task.type === TaskType.RERANKER && <RerankerNodeModal task={task} nodeData={nodeData} />}
                            {task.type === TaskType.QUERY && <QueryNodeModal task={task} nodeData={nodeData} />}
                            {task.type === TaskType.RESPONSE && <ResponseNodeModal task={task} nodeData={nodeData} />}
                        </Flex>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
