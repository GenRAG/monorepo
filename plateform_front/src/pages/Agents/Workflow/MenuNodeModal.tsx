import {
    Box,
    Text,
    IconButton,
    HStack,
    VStack,
    Flex,
    Tooltip,
    Icon,
    Badge,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    useColorModeValue,
    Input,
    Center,
} from "@chakra-ui/react";
import { Info, Search, X, CommandIcon } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useMemo, useState, useEffect, useRef } from "react";
import RerankerInformation from "pages/Agents/Workflow/NodeInformation/Reranker";
import { NodeShape } from "@genrag/workflow";
import StyledKbd from "components/System/Atoms/KdbStyles";

import type { AppNode } from "@genrag/workflow";
import {
    Task,
    TaskType,
    getTaskDef,
    listAddableTaskTypes,
} from "@genrag/workflow";

interface MenuNodeModalProps {
    usedNodes: AppNode[];
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
    addNode: (nodeType: TaskType) => void;
}

interface NodeCardProps {
    nodeType: TaskType;
    alreadyUsed: boolean;
    isSelected: boolean;
    isDragging: boolean;
    onDragStart: (e: React.DragEvent, type: TaskType) => void;
    onDragEnd: () => void;
    onClick: (type: TaskType) => void;
    tooltipContent: React.ReactNode;
}

const NodeCard = ({
    nodeType,
    alreadyUsed,
    isSelected,
    isDragging,
    onDragStart,
    onDragEnd,
    onClick,
    tooltipContent,
}: NodeCardProps) => {
    const task = getTaskDef(nodeType)!;
    const isDraggable = !alreadyUsed;

    const cardBg = useColorModeValue("white", "grey.800");
    const cardActiveBg = useColorModeValue("green.50", "grey.700");
    const borderColor = useColorModeValue("green.200", "grey.700");
    const borderActive = useColorModeValue("green.300", "green.500");
    const textColor = useColorModeValue("grey.900", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const tooltipBg = useColorModeValue("green.50", "grey.700");
    const badgeBg = useColorModeValue("grey.100", "grey.700");
    const badgeColor = useColorModeValue("grey.500", "grey.400");

    return (
        <Box
            draggable={isDraggable}
            onDragStart={
                isDraggable ? (e) => onDragStart(e, nodeType) : undefined
            }
            onDragEnd={isDraggable ? onDragEnd : undefined}
            onClick={isDraggable ? () => onClick(nodeType) : undefined}
            cursor={isDraggable ? "grab" : "default"}
            _active={{ cursor: isDraggable ? "grabbing" : "default" }}
            bg={isSelected || isDragging ? cardActiveBg : cardBg}
            border="1px solid"
            borderColor={isSelected || isDragging ? borderActive : borderColor}
            borderRadius="10px"
            p={2}
            transition="all 0.15s"
            opacity={alreadyUsed || isDragging ? 0.5 : 1}
            _hover={
                isDraggable
                    ? { bg: cardActiveBg, borderColor: borderActive }
                    : {}
            }
        >
            <Flex align="center" gap={3}>
                <Box flexShrink={0}>
                    <NodeShape
                        shape={task.shape}
                        icon={task.icon}
                        isSelected={false}
                        size={32}
                        iconSize={16}
                        canHover={false}
                    />
                </Box>

                <VStack align="start" spacing={0} flex={1} minW={0}>
                    <HStack spacing={2}>
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={textColor}
                            noOfLines={1}
                        >
                            {task.label}
                        </Text>
                        {alreadyUsed && (
                            <Badge
                                fontSize="9px"
                                fontWeight={700}
                                letterSpacing="0.06em"
                                bg={badgeBg}
                                color={badgeColor}
                                border="1px solid"
                                borderColor={borderColor}
                                borderRadius="4px"
                                px="5px"
                                textTransform="uppercase"
                            >
                                used
                            </Badge>
                        )}
                    </HStack>
                    <Text fontSize="xs" color={subColor} noOfLines={1}>
                        {task.description}
                    </Text>
                </VStack>

                {tooltipContent && (
                    <Tooltip
                        offset={[0, 20]}
                        boxShadow="xl"
                        bg={tooltipBg}
                        borderRadius="10px"
                        label={tooltipContent}
                        placement="right"
                        hasArrow
                        maxW="600px"
                    >
                        <Icon
                            as={Info}
                            boxSize={4}
                            cursor="pointer"
                            color={subColor}
                            flexShrink={0}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Tooltip>
                )}
            </Flex>
        </Box>
    );
};

const MenuNodeModal = ({
    usedNodes,
    isOpen,
    onClose,
    onToggle,
    addNode,
}: MenuNodeModalProps) => {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [draggedNode, setDraggedNode] = useState<TaskType | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { fitView } = useReactFlow();

    const bgColor = useColorModeValue("white", "grey.800");
    const borderColor = useColorModeValue("green.200", "grey.700");
    const dividerColor = useColorModeValue("green.100", "grey.700");
    const iconColor = useColorModeValue("grey.600", "grey.300");
    const hoverBg = useColorModeValue("grey.100", "grey.700");
    const textColor = useColorModeValue("grey.900", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const sectionColor = useColorModeValue("grey.400", "grey.600");
    const overlayBg = useColorModeValue("blackAlpha.500", "blackAlpha.700");
    const kbdBg = useColorModeValue("grey.50", "grey.700");

    const nodes = useMemo(() => listAddableTaskTypes(), []);

    const alreadyUsedNodes = useMemo(
        () => nodes.filter((nt) => usedNodes.some((n) => n.data.type === nt)),
        [nodes, usedNodes],
    );

    const availableNodes = useMemo(() => {
        const chainOutputTypes = new Set<TaskType>();
        usedNodes.forEach((n) => {
            const task = getTaskDef(n.data.type) as Task | undefined;
            task?.chainOutputs?.forEach((o) => {
                if (!usedNodes.some((used) => used.data.type === o.nodeType)) {
                    chainOutputTypes.add(o.nodeType);
                }
            });
        });

        return Array.from(chainOutputTypes);
    }, [usedNodes]);

    const filteredAvailable = useMemo(() => {
        if (!query) return availableNodes;
        const q = query.toLowerCase();
        return availableNodes.filter((nt) => {
            const task = getTaskDef(nt);
            return (
                task &&
                (task.label.toLowerCase().includes(q) ||
                    task.type.toLowerCase().includes(q))
            );
        });
    }, [query, availableNodes]);

    const tooltipContent = useMemo(
        () => ({
            [TaskType.RETRIEVER]: null,
            [TaskType.RERANKER]: <RerankerInformation />,
            [TaskType.RESPONSE]: null,
            [TaskType.QUERY]: null,
            [TaskType.MODEL]: null,
            [TaskType.INSTRUCTION]: null,
            [TaskType.REWRITER]: null,
        }),
        [],
    );

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                onToggle();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onToggle]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleClose = () => {
        onClose();
        setTimeout(async () => {
            await fitView({ duration: 500, minZoom: 1, maxZoom: 1 });
        }, 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) =>
                Math.min(i + 1, filteredAvailable.length - 1),
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && filteredAvailable[selectedIndex]) {
            handleNodeClick(filteredAvailable[selectedIndex]);
        }
    };

    const handleNodeClick = (nodeType: TaskType) => {
        addNode(nodeType);
        handleClose();
    };

    const handleDragStart = (e: React.DragEvent, nodeType: TaskType) => {
        setDraggedNode(nodeType);
        e.dataTransfer.setData("application/reactflow", nodeType);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => setDraggedNode(null);

    return (
        <Box>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                isCentered
                motionPreset="scale"
            >
                <ModalOverlay bg={overlayBg} backdropFilter="blur(4px)" />
                <ModalContent
                    bg={bgColor}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="14px"
                    boxShadow="0 20px 60px rgba(0,0,0,0.15)"
                    overflow="hidden"
                    mx={4}
                    maxW="480px"
                >
                    <ModalBody p={0}>
                        <HStack
                            px={4}
                            py={3}
                            borderBottom="1px solid"
                            borderColor={dividerColor}
                            spacing={3}
                        >
                            <Icon
                                as={Search}
                                boxSize={4}
                                color={iconColor}
                                flexShrink={0}
                            />
                            <Input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search nodes…"
                                fontSize="sm"
                                color={textColor}
                                _placeholder={{ color: subColor }}
                                flex={1}
                            />
                            <HStack spacing={1} flexShrink={0}>
                                <Box p="3.5" bg={kbdBg} borderRadius="4px">
                                    <Center>
                                        <Icon as={CommandIcon} />
                                    </Center>
                                </Box>
                                <Box
                                    bg={kbdBg}
                                    borderRadius="4px"
                                    px="4"
                                    py="3"
                                >
                                    <Center>
                                        <Text>K</Text>
                                    </Center>
                                </Box>
                            </HStack>
                            <IconButton
                                aria-label="Close"
                                icon={<X size={14} />}
                                size="xs"
                                variant="ghost"
                                color={iconColor}
                                _hover={{ bg: hoverBg }}
                                onClick={handleClose}
                            />
                        </HStack>

                        <VStack
                            align="stretch"
                            p={2}
                            spacing={1}
                            maxH="360px"
                            overflowY="auto"
                            sx={{
                                "&::-webkit-scrollbar": { width: "4px" },
                                "&::-webkit-scrollbar-thumb": {
                                    bg: borderColor,
                                    borderRadius: "4px",
                                },
                            }}
                        >
                            {filteredAvailable.length > 0 && (
                                <>
                                    <Text
                                        fontSize="10px"
                                        fontWeight={700}
                                        letterSpacing="0.08em"
                                        textTransform="uppercase"
                                        color={sectionColor}
                                        px={2}
                                        pt={2}
                                        pb={1}
                                    >
                                        Available
                                    </Text>
                                    {filteredAvailable.map((nodeType, i) => (
                                        <NodeCard
                                            key={nodeType}
                                            nodeType={nodeType}
                                            alreadyUsed={false}
                                            isSelected={i === selectedIndex}
                                            isDragging={
                                                draggedNode === nodeType
                                            }
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                            onClick={handleNodeClick}
                                            tooltipContent={
                                                tooltipContent[nodeType]
                                            }
                                        />
                                    ))}
                                </>
                            )}

                            {filteredAvailable.length === 0 && (
                                <Flex justify="center" py={8}>
                                    <Text fontSize="sm" color={subColor}>
                                        No nodes match &quot;
                                        <Text as="span" color={textColor}>
                                            {query}
                                        </Text>
                                        &quot;
                                    </Text>
                                </Flex>
                            )}

                            {alreadyUsedNodes.length > 0 && !query && (
                                <>
                                    <Box
                                        borderTop="1px solid"
                                        borderColor={dividerColor}
                                        mt={2}
                                    />
                                    <Text
                                        fontSize="10px"
                                        fontWeight={700}
                                        letterSpacing="0.08em"
                                        textTransform="uppercase"
                                        color={sectionColor}
                                        px={2}
                                        pt={2}
                                        pb={1}
                                    >
                                        Already in workflow
                                    </Text>
                                    {alreadyUsedNodes.map((nodeType) => (
                                        <NodeCard
                                            key={nodeType}
                                            nodeType={nodeType}
                                            alreadyUsed={true}
                                            isSelected={false}
                                            isDragging={false}
                                            onDragStart={handleDragStart}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => {}}
                                            tooltipContent={
                                                tooltipContent[nodeType]
                                            }
                                        />
                                    ))}
                                </>
                            )}
                        </VStack>

                        <HStack
                            px={4}
                            py={2}
                            borderTop="1px solid"
                            borderColor={dividerColor}
                            spacing={4}
                        >
                            {[
                                { keys: ["↑", "↓"], label: "navigate" },
                                { keys: ["↵"], label: "add" },
                                { keys: ["drag"], label: "place" },
                                { keys: ["⌘", "K"], label: "close" },
                            ].map(({ keys, label }) => (
                                <HStack key={label} spacing={1}>
                                    {keys.map((k) => (
                                        <StyledKbd key={k}>{k}</StyledKbd>
                                    ))}
                                    <Text fontSize="11px" color={subColor}>
                                        {label}
                                    </Text>
                                </HStack>
                            ))}
                        </HStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default MenuNodeModal;
