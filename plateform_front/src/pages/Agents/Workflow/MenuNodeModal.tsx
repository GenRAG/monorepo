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
} from "@chakra-ui/react";
import { Info, Search, X } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useMemo, useState, useEffect, useRef } from "react";
import RerankerInformation from "components/Agents/Workflow/NodeInformation/Reranker";
import RewriterInformation from "components/Agents/Workflow/NodeInformation/Rewriter";
import StyledKbd from "components/ui/KdbStyles";

import type { AppNode } from "@genrag/workflow";
import { TaskType, getTaskDef, getNonSettingsTaskTypes, getAddableTaskTypes } from "@genrag/workflow";
import BoxIcon from "components/ui/BoxIcon";

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
    onClick: (type: TaskType) => void;
    tooltipContent: React.ReactNode;
}

const NodeCard = ({ nodeType, alreadyUsed, isSelected, onClick, tooltipContent }: NodeCardProps) => {
    const task = getTaskDef(nodeType)!;
    const isDraggable = !alreadyUsed;

    const cardBg = useColorModeValue("white", "grey.850");
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
            onClick={isDraggable ? () => onClick(nodeType) : undefined}
            bg={isSelected ? cardActiveBg : cardBg}
            border="1px solid"
            borderColor={isSelected ? borderActive : borderColor}
            borderRadius="10px"
            p={2}
            transition="all 0.15s"
            opacity={alreadyUsed ? 0.5 : 1}
            _hover={isDraggable ? { bg: cardActiveBg, borderColor: borderActive } : {}}
        >
            <Flex align="center" gap={3}>
                <Box flexShrink={0}>
                    <BoxIcon icon={task.icon} />
                </Box>

                <VStack align="start" spacing={0} flex={1} minW={0}>
                    <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="semibold" color={textColor} noOfLines={1}>
                            {task.label}
                        </Text>
                        {alreadyUsed && (
                            <Badge bg={badgeBg} color={badgeColor} size="sm">
                                UTILISE
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

const MenuNodeModal = ({ usedNodes, isOpen, onClose, onToggle, addNode }: MenuNodeModalProps) => {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { fitView } = useReactFlow();

    const bgColor = useColorModeValue("white", "grey.900");
    const borderColor = useColorModeValue("green.200", "grey.700");
    const dividerColor = useColorModeValue("green.100", "grey.700");
    const iconColor = useColorModeValue("grey.600", "grey.300");
    const hoverBg = useColorModeValue("grey.100", "grey.700");
    const textColor = useColorModeValue("grey.900", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const sectionColor = useColorModeValue("grey.400", "grey.600");
    const overlayBg = useColorModeValue("blackAlpha.500", "blackAlpha.700");

    const presentTypes = useMemo(() => usedNodes.map((n) => n.data.type), [usedNodes]);

    const alreadyUsedNodes = useMemo(
        () => getNonSettingsTaskTypes().filter((nt) => presentTypes.includes(nt)),
        [presentTypes],
    );

    const availableNodes = useMemo(() => getAddableTaskTypes(presentTypes), [presentTypes]);

    const filteredAvailable = useMemo(() => {
        if (!query) return availableNodes;
        const q = query.toLowerCase();
        return availableNodes.filter((nt) => {
            const task = getTaskDef(nt);
            return task && (task.label.toLowerCase().includes(q) || task.type.toLowerCase().includes(q));
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
            [TaskType.REWRITER]: <RewriterInformation />,
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
            setSelectedIndex((i) => Math.min(i + 1, filteredAvailable.length - 1));
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

    return (
        <Box>
            <Modal isOpen={isOpen} onClose={handleClose} isCentered motionPreset="scale">
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
                        <HStack px={4} py={3} borderBottom="1px solid" borderColor={dividerColor} spacing={3}>
                            <Icon as={Search} boxSize={4} color={iconColor} flexShrink={0} />
                            <Input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Chercher des blocs…"
                                fontSize="sm"
                                color={textColor}
                                _placeholder={{ color: subColor }}
                                flex={1}
                                size="sm"
                            />
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
                                        Disponibles
                                    </Text>
                                    {filteredAvailable.map((nodeType, i) => (
                                        <NodeCard
                                            key={nodeType}
                                            nodeType={nodeType}
                                            alreadyUsed={false}
                                            isSelected={i === selectedIndex}
                                            onClick={handleNodeClick}
                                            tooltipContent={tooltipContent[nodeType]}
                                        />
                                    ))}
                                </>
                            )}

                            {filteredAvailable.length === 0 && (
                                <Flex justify="center" py={8}>
                                    <Text fontSize="sm" color={subColor}>
                                        Aucun nœud ne correspond à &quot;
                                        <Text as="span" color={textColor}>
                                            {query}
                                        </Text>
                                        &quot;
                                    </Text>
                                </Flex>
                            )}

                            {alreadyUsedNodes.length > 0 && !query && (
                                <>
                                    <Box borderTop="1px solid" borderColor={dividerColor} mt={2} />
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
                                        Déjà dans le workflow
                                    </Text>
                                    {alreadyUsedNodes.map((nodeType) => (
                                        <NodeCard
                                            key={nodeType}
                                            nodeType={nodeType}
                                            alreadyUsed={true}
                                            isSelected={false}
                                            onClick={() => {}}
                                            tooltipContent={tooltipContent[nodeType]}
                                        />
                                    ))}
                                </>
                            )}
                        </VStack>

                        <HStack px={4} py={2} borderTop="1px solid" borderColor={dividerColor} spacing={4}>
                            {[
                                { keys: ["↑", "↓"], label: "naviguer" },
                                { keys: ["↵"], label: "ajouter" },
                                { keys: ["drag"], label: "placer" },
                                { keys: ["⌘", "K"], label: "fermer" },
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
