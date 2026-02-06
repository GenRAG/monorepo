import {
    Box, Text, useColorMode, IconButton, HStack, useColorModeValue,
    VStack, Flex, Tooltip,
    Icon
} from "@chakra-ui/react";
import { Info, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReactFlow } from "@xyflow/react";
import { TaskRegistry } from "lib/workflow/task/registry";
import { TaskType } from "lib/type/task";
import { NodeShape } from "components/Molecules/Nodes/NodeShape";
import { useMemo, useState } from "react";
import { RootState } from "@reduxjs/toolkit/query";
import { AppNode } from "lib/type/app-node";
import RerankerInformation from "pages/Workspace/Workflow/NodeInformation/Reranker";

interface MenuNodeModalProps {
    usedNodes: AppNode[];
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
}

const MenuNodeModal = ({
    usedNodes,
    isOpen,
    onClose,
    onToggle
}: MenuNodeModalProps) => {

    const bgColor = useColorModeValue("white", "grey.800");
    const borderColor = useColorModeValue("green.200", "grey.700");
    const iconColor = useColorModeValue("grey.700", "grey.300");
    const hoverBg = useColorModeValue("grey.100", "grey.700");
    const cardBg = useColorModeValue("white", "grey.800");
    const cardHoverBg = useColorModeValue("green.50", "grey.700");
    const cardBorderHover = useColorModeValue("green.300", "green.500");
    const textColor = useColorModeValue("grey.900", "grey.100");
    const tooltipBg = useColorModeValue("green.50", "grey.700");
    const { fitView } = useReactFlow();
    const [draggedNode, setDraggedNode] = useState<TaskType | null>(null);

    const nodes = useMemo(() => Object.keys(TaskRegistry) as TaskType[], []);

    const alreadyUsedNodes = useMemo(() => nodes.filter((nodeType) => {
        return usedNodes.some((node) => node.data.type === nodeType);
    }), [nodes, usedNodes]);

    const availableNodes = useMemo(() => nodes.filter((nodeType) => {
        return !alreadyUsedNodes.includes(nodeType);
    }), [nodes, alreadyUsedNodes]);

    const handleDragStart = (e: React.DragEvent, nodeType: TaskType) => {
        setDraggedNode(nodeType);
        e.dataTransfer.setData("application/reactflow", nodeType);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => {
        setDraggedNode(null);
    };

    const handleNodeClick = (nodeType: TaskType) => {
        console.log("Node clicked:", nodeType);
    };

    const tooltipContent = useMemo(() => {
        return {
            [TaskType.RETRIEVER]: null,
            [TaskType.RERANKER]: <RerankerInformation />,
            [TaskType.RESPONSE]: null,
            [TaskType.QUERY]: null,
        };
    }, []);

    return (
        <Box position="absolute" top={5} left={5} zIndex={1000} h="95%">
            <motion.div
                animate={{ width: isOpen ? "200px" : "0px" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ height: "100%", overflow: "hidden", display: "flex" }}
            >
                <HStack spacing={0} align="stretch" w="200px" h="100%">
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ x: "-100%", opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "-100%", opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                style={{ height: "100%", display: "flex", width: "200px" }}
                            >
                                <Flex
                                    w="200px"
                                    bg={bgColor}
                                    border="1px solid"
                                    borderColor={borderColor}
                                    boxShadow="lg"
                                    borderRadius="12px"
                                    position="relative"
                                    h="100%"
                                    direction="column"
                                >
                                    <Box
                                        p={4}
                                        borderBottom="1px solid"
                                        borderColor={borderColor}
                                    >
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                                                Add a new node to your workflow
                                            </Text>
                                            <IconButton
                                                aria-label="Close menu"
                                                icon={<X size={20} />}
                                                size="sm"
                                                bg={bgColor}
                                                color={iconColor}
                                                _hover={{
                                                    bg: hoverBg,
                                                }}
                                                onClick={() => {
                                                    onToggle();
                                                    setTimeout(() => {
                                                        fitView({ duration: 500 });
                                                    }, 500);
                                                }}
                                            />
                                        </HStack>
                                        <Text fontSize="xs" color={iconColor} mt={1}>
                                            Drag or click to add
                                        </Text>
                                    </Box>
                                    <VStack
                                        flex={1}
                                        p={3}
                                        spacing={3}
                                        align="stretch"
                                        overflowY="auto"
                                    >
                                        {availableNodes.map((nodeType) => {
                                            const task = TaskRegistry[nodeType];
                                            const isDragging = draggedNode === nodeType;
                                            return (
                                                <motion.div
                                                    key={nodeType}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    style={{ width: "100%" }}
                                                >
                                                    <Box
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, nodeType)}
                                                        onDragEnd={handleDragEnd}
                                                        onClick={() => handleNodeClick(nodeType)}
                                                        cursor="grab"
                                                        _active={{ cursor: "grabbing" }}
                                                        bg={cardBg}
                                                        border="1px solid"
                                                        borderColor={isDragging ? cardBorderHover : borderColor}
                                                        borderRadius="12px"
                                                        p={2}
                                                        transition="all 0.2s"
                                                        _hover={{
                                                            bg: cardHoverBg,
                                                            borderColor: cardBorderHover,
                                                        }}
                                                        opacity={isDragging ? 0.5 : 1}
                                                    >
                                                        <Flex align="center" gap={3}>
                                                            <Box flexShrink={0}>
                                                                <NodeShape
                                                                    shape={task.shape}
                                                                    icon={task.icon}
                                                                    isSelected={false}
                                                                    size={28}
                                                                    iconSize={16}
                                                                    canHover={false}
                                                                />
                                                            </Box>
                                                            <VStack align="start" spacing={0} flex={1}>
                                                                <Text
                                                                    fontSize="sm"
                                                                    fontWeight="semibold"
                                                                    color={textColor}
                                                                    noOfLines={1}
                                                                >
                                                                    {task.label}
                                                                </Text>
                                                                <Text
                                                                    fontSize="xs"
                                                                    color={iconColor}
                                                                    noOfLines={1}
                                                                >
                                                                    {task.type}
                                                                </Text>
                                                            </VStack>
                                                            <Tooltip offset={[0, 20]} bg={tooltipBg} borderRadius="12px" borderColor={borderColor} label={tooltipContent[nodeType as TaskType]} placement="right-end" hasArrow>
                                                                <Icon
                                                                    aria-label="Show node information"
                                                                    as={Info}
                                                                    size="md"
                                                                    cursor="pointer"
                                                                    color={iconColor}
                                                                />
                                                            </Tooltip>
                                                        </Flex>
                                                    </Box>
                                                </motion.div>
                                            );
                                        })}
                                        {alreadyUsedNodes.length > 0 && (
                                            <Text fontSize="xs" color={iconColor} mt={1}>
                                                Already used nodes:
                                            </Text>
                                        )}
                                        {alreadyUsedNodes.map((nodeType) => {
                                            const task = TaskRegistry[nodeType];
                                            return (
                                                <Box key={nodeType} p={2} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="12px">
                                                    <Flex align="center" gap={3}>
                                                        <Box flexShrink={0}>
                                                            <NodeShape
                                                                shape={task.shape}
                                                                icon={task.icon}
                                                                isSelected={false}
                                                                size={28}
                                                                iconSize={16}
                                                                canHover={false}
                                                            />
                                                        </Box>
                                                        <VStack align="start" spacing={0} flex={1}>
                                                            <Text
                                                                fontSize="sm"
                                                                fontWeight="semibold"
                                                                color={textColor}
                                                                noOfLines={1}
                                                            >
                                                                {task.label}
                                                            </Text>
                                                            <Text
                                                                fontSize="xs"
                                                                color={iconColor}
                                                                noOfLines={1}
                                                            >
                                                                {task.type}
                                                            </Text>
                                                        </VStack>
                                                        {task.isDeletable && (
                                                            <Tooltip offset={[0, 20]} bg={tooltipBg} borderRadius="12px" borderColor={borderColor} label={tooltipContent[nodeType as TaskType]} placement="right-end" hasArrow>
                                                                <Icon
                                                                    aria-label="Show node information"
                                                                    as={Info}
                                                                    size="md"
                                                                    cursor="pointer"
                                                                    color={iconColor}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </Flex>
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                </Flex>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </HStack>
            </motion.div>
            {!isOpen && (
                <IconButton
                    aria-label="Open menu"
                    icon={<Menu size={20} />}
                    onClick={() => {
                        onToggle();
                        setTimeout(() => {
                            fitView({ duration: 500 });
                        }, 500);
                    }}
                    bg={bgColor}
                    borderColor={borderColor}
                    border="1px solid"
                    borderRadius="12px"
                    position="absolute"
                    top="2"
                    left="2"
                    color={iconColor}
                    _hover={{
                        bg: hoverBg,
                    }}
                    zIndex={1001}
                />
            )}
        </Box>
    )
}

export default MenuNodeModal;