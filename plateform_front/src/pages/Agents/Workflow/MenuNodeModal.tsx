import {
    Box,
    Text,
    IconButton,
    HStack,
    VStack,
    Flex,
    Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    useColorModeValue,
    Input,
    Divider,
    Stack,
} from "@chakra-ui/react";
import { Search, X } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useMemo, useState, useEffect, useRef } from "react";
import RerankerInformation from "components/Agents/Workflow/NodeInformation/Reranker";
import RewriterInformation from "components/Agents/Workflow/NodeInformation/Rewriter";
import StyledKbd from "components/ui/KdbStyles";
import { MenuNodeCard } from "pages/Agents/Workflow/MenuNodeCard";
import { useCommandPaletteKeyboard } from "hooks/useCommandPaletteKeyboard";

import type { AppNode } from "@genrag/workflow";
import { TaskType, getTaskDef, getNonSettingsTaskTypes, getAddableTaskTypes } from "@genrag/workflow";

interface MenuNodeModalProps {
    usedNodes: AppNode[];
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
    addNode: (nodeType: TaskType) => void;
}

const MenuNodeModal = ({ usedNodes, isOpen, onClose, onToggle, addNode }: MenuNodeModalProps) => {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { fitView } = useReactFlow();

    const dividerColor = useColorModeValue("green.100", "grey.700");
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

    useCommandPaletteKeyboard(onToggle);

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
                    bg="surfaceCard"
                    border="1px solid"
                    borderColor="borderAccentCardMuted"
                    borderRadius="14px"
                    boxShadow="0 20px 60px rgba(0,0,0,0.15)"
                    overflow="hidden"
                    mx={4}
                    maxW="480px"
                >
                    <ModalBody p={0}>
                        <HStack px={4} py={3} borderBottom="1px solid" borderColor={dividerColor} spacing={3}>
                            <Icon as={Search} boxSize={4} color="textBody" flexShrink={0} />
                            <Input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Chercher des blocs…"
                                fontSize="sm"
                                color="textPrimary"
                                _placeholder={{ color: "textLabel" }}
                                flex={1}
                                size="sm"
                            />
                            <IconButton
                                aria-label="Close"
                                icon={<X size={14} />}
                                size="xs"
                                variant="ghost"
                                color="textBody"
                                _hover={{ bg: "borderSubtle" }}
                                onClick={handleClose}
                            />
                        </HStack>

                        <VStack
                            align="stretch"
                            spacing={1}
                            maxH="360px"
                            overflowY="auto"
                            sx={{
                                "&::-webkit-scrollbar": { width: "4px" },
                                "&::-webkit-scrollbar-thumb": {
                                    bg: "borderAccentCardMuted",
                                    borderRadius: "4px",
                                },
                            }}
                        >
                            {filteredAvailable.length > 0 && (
                                <Stack px={2} pb={2}>
                                    <Text
                                        fontSize="10px"
                                        fontWeight={700}
                                        letterSpacing="0.08em"
                                        textTransform="uppercase"
                                        color="textMuted"
                                        px={2}
                                        pt={2}
                                        pb={1}
                                    >
                                        Disponibles
                                    </Text>
                                    {filteredAvailable.map((nodeType, i) => (
                                        <MenuNodeCard
                                            key={nodeType}
                                            nodeType={nodeType}
                                            alreadyUsed={false}
                                            isSelected={i === selectedIndex}
                                            onClick={handleNodeClick}
                                            tooltipContent={tooltipContent[nodeType]}
                                        />
                                    ))}
                                </Stack>
                            )}

                            {filteredAvailable.length === 0 && availableNodes.length > 0 && (
                                <Flex justify="center" py={8} px={2}>
                                    <Text fontSize="sm" color="textLabel">
                                        Aucun nœud ne correspond à &quot;
                                        <Text as="span" color="textPrimary">
                                            {query}
                                        </Text>
                                        &quot;
                                    </Text>
                                </Flex>
                            )}

                            {availableNodes.length === 0 && filteredAvailable.length === 0 && (
                                <Flex justify="center" py={8} px={2}>
                                    <Text fontSize="sm" color="textLabel">
                                        Pas de blocs disponibles.
                                    </Text>
                                </Flex>
                            )}
                            <Divider borderColor={dividerColor} my={2} />

                            {alreadyUsedNodes.length > 0 && !query && (
                                <Stack px={2} pb={2}>
                                    <Text
                                        fontSize="10px"
                                        fontWeight={700}
                                        letterSpacing="0.08em"
                                        textTransform="uppercase"
                                        color="textMuted"
                                        px={2}
                                        pt={2}
                                        pb={1}
                                    >
                                        Déjà dans le workflow
                                    </Text>
                                    {alreadyUsedNodes.map((nodeType) => (
                                        <MenuNodeCard
                                            key={nodeType}
                                            nodeType={nodeType}
                                            alreadyUsed={true}
                                            isSelected={false}
                                            onClick={() => {}}
                                            tooltipContent={tooltipContent[nodeType]}
                                        />
                                    ))}
                                </Stack>
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
                                    <Text fontSize="11px" color="textLabel">
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
