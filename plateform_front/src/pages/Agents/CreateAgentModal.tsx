import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    Grid,
    HStack,
    Icon,
    Input,
    Modal,
    ModalContent,
    ModalOverlay,
    SimpleGrid,
    Text,
    Textarea,
    useColorMode,
    useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import { MessageSquare, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkflowPreview } from "components/System/Molecules/WorkflowPreview/WorkflowPreview";
import { useCreateAgentMutation } from "services/agent/agent";
import useThemedToast from "hooks/useThemedToast";
import {
    makeFlowNode,
    linkNodes,
    withAutoSettings,
    type AppNode,
    type TaskType,
} from "@genrag/workflow";
import type { Edge } from "@xyflow/react";

interface Template {
    id: string;
    name: string;
    description: string;
    nodes: AppNode[];
    edges: Edge[];
}

const _blankMain = {
    nodes: [
        makeFlowNode("q", "QUERY" as TaskType, 0, -50),
        makeFlowNode("r", "RETRIEVER" as TaskType, 260, 0),
        makeFlowNode("s", "RESPONSE" as TaskType, 520, 100),
    ],
    edges: [linkNodes("q", "r"), linkNodes("r", "s")],
};
const { nodes: BLANK_NODES, edges: BLANK_EDGES } = withAutoSettings(
    _blankMain.nodes,
    _blankMain.edges,
);

const _faqMain = {
    nodes: [
        makeFlowNode("q", "QUERY" as TaskType, 0, 0),
        makeFlowNode("w", "REWRITER" as TaskType, 0, 180),
        makeFlowNode("r", "RETRIEVER" as TaskType, 400, 280),
        makeFlowNode("k", "RERANKER" as TaskType, 0, 450),
        makeFlowNode("s", "RESPONSE" as TaskType, 360, 550),
    ],
    edges: [
        linkNodes("q", "w"),
        linkNodes("w", "r"),
        linkNodes("r", "k"),
        linkNodes("k", "s"),
    ],
};
const { nodes: _faqNodes, edges: _faqEdges } = withAutoSettings(
    _faqMain.nodes,
    _faqMain.edges,
    {
        w: { "Large Language Model": "Mistral" },
        k: { ReRanking: "BGE" },
        s: {
            "Large Language Model": "GPT-4o",
            Instructions: "You are a helpful assistant.",
        },
    },
);

const TEMPLATES: Template[] = [
    {
        id: "basic",
        name: "FAQ Assistant",
        description:
            "Répond aux questions fréquentes à partir de vos documents.",
        nodes: _faqNodes,
        edges: _faqEdges,
    },
];

interface CreateAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
    isOpen,
    onClose,
    workspaceId,
}) => {
    const navigate = useNavigate();
    const toast = useThemedToast();
    const [createAgent, { isLoading }] = useCreateAgentMutation();
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        null,
    );

    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

    const modalBg = useColorModeValue("white", "grey.950");
    const rightBg = useColorModeValue("grey.50", "grey.975");
    const dividerColor = useColorModeValue("grey.100", "grey.800");
    const cardBg = useColorModeValue("grey.50", "grey.900");
    const inputBg = useColorModeValue("grey.50", "grey.900");
    const inputBorder = useColorModeValue("grey.200", "grey.700");
    const titleColor = useColorModeValue("grey.900", "grey.100");
    const labelColor = useColorModeValue("grey.500", "grey.400");
    const mutedColor = useColorModeValue("grey.400", "grey.600");
    const closeBtnHover = useColorModeValue("grey.50", "grey.900");
    const typeCardActiveBg = useColorModeValue("green.50", "grey.850");
    const typeCardIconBg = useColorModeValue("green.100", "grey.800");
    const tplCardBg = useColorModeValue("white", "grey.900");
    const tplCardHoverBg = useColorModeValue("grey.50", "grey.850");
    const tplCardSelBg = useColorModeValue("green.50", "grey.850");
    const rightTopGrad = isDark
        ? "linear-gradient(to bottom, var(--chakra-colors-grey-975) 0%, transparent 100%)"
        : "linear-gradient(to bottom, var(--chakra-colors-grey-50) 0%, transparent 100%)";

    const previewNodes = selectedTemplate?.nodes ?? BLANK_NODES;
    const previewEdges = selectedTemplate?.edges ?? BLANK_EDGES;
    const previewTitle = selectedTemplate?.name ?? "Agent Chatflow";
    const previewDesc =
        selectedTemplate?.description ??
        "Visually build AI workflows with drag-and-drop simplicity and connect your documents.";

    useEffect(() => {
        if (isOpen) {
            setName("");
            setDescription("");
            setSelectedTemplate(null);
            setTimeout(() => nameInputRef.current?.focus(), 80);
        }
    }, [isOpen]);

    const handleSelectTemplate = (tpl: Template) => {
        if (selectedTemplate?.id === tpl.id) {
            setSelectedTemplate(null);
            return;
        }
        setSelectedTemplate(tpl);
        if (!name) setName(tpl.name);
        if (!description) setDescription(tpl.description);
    };

    const handleCreate = useCallback(async () => {
        if (!name.trim()) return;
        try {
            const agent = await createAgent({
                workspaceId,
                name: name.trim(),
                description: description.trim() || undefined,
            }).unwrap();
            onClose();
            void navigate(
                `/workspaces/${workspaceId}/agents/${agent.id}/playground`,
            );
        } catch {
            toast({
                title: "Erreur lors de la création",
                description: "Veuillez réessayer.",
                status: "error",
                duration: 3000,
            });
        }
    }, [name, description, workspaceId, createAgent, navigate, onClose, toast]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                void handleCreate();
            }
        },
        [handleCreate],
    );

    const isMac =
        typeof navigator !== "undefined" && /Mac/i.test(navigator.userAgent);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            motionPreset="slideInBottom"
        >
            <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(4px)" />
            <ModalContent
                bg={modalBg}
                borderRadius={0}
                overflow="hidden"
                m={0}
                maxW="100vw"
                maxH="100vh"
                h="100vh"
                onKeyDown={handleKeyDown}
            >
                <Box
                    position="absolute"
                    top={4}
                    right={4}
                    zIndex={20}
                    as="button"
                    w="32px"
                    h="32px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="8px"
                    color={labelColor}
                    border="1px solid"
                    borderColor={dividerColor}
                    bg={cardBg}
                    _hover={{ bg: closeBtnHover, color: titleColor }}
                    transition="all 0.12s"
                    onClick={onClose}
                >
                    <Icon as={X} boxSize={4} />
                </Box>

                <Grid templateColumns="1fr 1fr" h="100%">
                    <Flex
                        direction="column"
                        px={16}
                        pt={16}
                        pb={8}
                        borderRight="1px solid"
                        borderColor={dividerColor}
                        overflowY="auto"
                    >
                        <Text
                            fontSize="24px"
                            fontWeight="600"
                            color={titleColor}
                            mb={8}
                            lineHeight="1.2"
                        >
                            Create from Blank
                        </Text>

                        <Text
                            fontSize="13px"
                            fontWeight="500"
                            color={labelColor}
                            mb={3}
                        >
                            Choose an App Type
                        </Text>

                        <Box
                            p={4}
                            borderRadius="10px"
                            border="1.5px solid"
                            borderColor="green.500"
                            bg={typeCardActiveBg}
                            mb={7}
                            maxW="260px"
                            cursor="default"
                        >
                            <HStack spacing={3} align="flex-start">
                                <Box
                                    w="36px"
                                    h="36px"
                                    borderRadius="8px"
                                    bg={typeCardIconBg}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexShrink={0}
                                >
                                    <Icon
                                        as={MessageSquare}
                                        boxSize="16px"
                                        color="green.500"
                                    />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text
                                        fontSize="14px"
                                        fontWeight="600"
                                        color={titleColor}
                                        lineHeight="1.3"
                                    >
                                        Agent Chatflow
                                    </Text>
                                    <Text
                                        fontSize="12px"
                                        color={labelColor}
                                        lineHeight="1.5"
                                        mt="2px"
                                    >
                                        Workflow enhanced for creating chat
                                        assistants
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>

                        <Divider borderColor={dividerColor} mb={7} />

                        {/* App Name */}
                        <Text
                            fontSize="13px"
                            fontWeight="500"
                            color={titleColor}
                            mb={3}
                        >
                            App Name
                        </Text>

                        <Input
                            ref={nameInputRef}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Give your app a name"
                            bg={inputBg}
                            border="1px solid"
                            borderColor={inputBorder}
                            borderRadius="8px"
                            fontSize="14px"
                            color={titleColor}
                            _placeholder={{ color: mutedColor }}
                            _focus={{
                                borderColor: "green.500",
                                boxShadow:
                                    "0 0 0 2px var(--chakra-colors-green-100)",
                            }}
                            h="42px"
                            mb={6}
                        />

                        {/* Description */}
                        <Text
                            fontSize="13px"
                            fontWeight="500"
                            color={titleColor}
                            mb={3}
                        >
                            Description{" "}
                            <Text as="span" fontWeight="400" color={mutedColor}>
                                (Optional)
                            </Text>
                        </Text>

                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter the description of the app"
                            bg={inputBg}
                            border="1px solid"
                            borderColor={inputBorder}
                            borderRadius="8px"
                            fontSize="14px"
                            color={titleColor}
                            _placeholder={{ color: mutedColor }}
                            _focus={{
                                borderColor: "green.500",
                                boxShadow:
                                    "0 0 0 2px var(--chakra-colors-green-100)",
                            }}
                            rows={4}
                            resize="none"
                            mb={6}
                        />

                        {/* Templates */}
                        <Text
                            fontSize="13px"
                            fontWeight="500"
                            color={labelColor}
                            mb={3}
                        >
                            Ou partir d&apos;un template
                        </Text>

                        <SimpleGrid columns={3} spacing={3} mb={6}>
                            {TEMPLATES.map((tpl) => {
                                const isSelected =
                                    selectedTemplate?.id === tpl.id;
                                return (
                                    <Box
                                        key={tpl.id}
                                        p={3}
                                        borderRadius="10px"
                                        border="1.5px solid"
                                        borderColor={
                                            isSelected
                                                ? "green.500"
                                                : dividerColor
                                        }
                                        bg={
                                            isSelected
                                                ? tplCardSelBg
                                                : tplCardBg
                                        }
                                        cursor="pointer"
                                        onClick={() =>
                                            handleSelectTemplate(tpl)
                                        }
                                        _hover={{
                                            bg: isSelected
                                                ? tplCardSelBg
                                                : tplCardHoverBg,
                                            borderColor: isSelected
                                                ? "green.500"
                                                : "grey.400",
                                        }}
                                        transition="all 0.12s"
                                    >
                                        <Text
                                            fontSize="12px"
                                            fontWeight="600"
                                            color={
                                                isSelected
                                                    ? "green.600"
                                                    : titleColor
                                            }
                                            mb={1}
                                            lineHeight="1.3"
                                            noOfLines={1}
                                        >
                                            {tpl.name}
                                        </Text>
                                        <Text
                                            fontSize="11px"
                                            color={labelColor}
                                            lineHeight="1.4"
                                            noOfLines={2}
                                        >
                                            {tpl.description}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </SimpleGrid>

                        <Box flex={1} />

                        <HStack justify="flex-end" align="center" pt={4}>
                            <HStack spacing={2}>
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    color={labelColor}
                                    fontWeight="400"
                                    fontSize="14px"
                                    h="38px"
                                    px={5}
                                    borderRadius="8px"
                                    _hover={{ bg: cardBg, color: titleColor }}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={handleCreate}
                                    isDisabled={!name.trim()}
                                    isLoading={isLoading}
                                    h="38px"
                                    px={5}
                                    fontSize="14px"
                                    fontWeight="500"
                                    bg={name.trim() ? "green.500" : cardBg}
                                    color={name.trim() ? "white" : mutedColor}
                                    border="1px solid"
                                    borderColor={
                                        name.trim() ? "green.500" : inputBorder
                                    }
                                    borderRadius="8px"
                                    _hover={{
                                        bg: name.trim() ? "green.600" : cardBg,
                                    }}
                                    _disabled={{
                                        opacity: 1,
                                        cursor: "default",
                                    }}
                                    transition="all 0.12s"
                                    rightIcon={
                                        <HStack spacing="3px" ml={1}>
                                            <Box
                                                as="span"
                                                px="5px"
                                                py="1px"
                                                borderRadius="4px"
                                                bg={
                                                    name.trim()
                                                        ? "whiteAlpha.300"
                                                        : cardBg
                                                }
                                                border="1px solid"
                                                borderColor={
                                                    name.trim()
                                                        ? "whiteAlpha.400"
                                                        : dividerColor
                                                }
                                                fontSize="11px"
                                                color={
                                                    name.trim()
                                                        ? "whiteAlpha.900"
                                                        : mutedColor
                                                }
                                                lineHeight="18px"
                                            >
                                                {isMac ? "⌘" : "Ctrl"}
                                            </Box>
                                            <Box
                                                as="span"
                                                px="5px"
                                                py="1px"
                                                borderRadius="4px"
                                                bg={
                                                    name.trim()
                                                        ? "whiteAlpha.300"
                                                        : cardBg
                                                }
                                                border="1px solid"
                                                borderColor={
                                                    name.trim()
                                                        ? "whiteAlpha.400"
                                                        : dividerColor
                                                }
                                                fontSize="11px"
                                                color={
                                                    name.trim()
                                                        ? "whiteAlpha.900"
                                                        : mutedColor
                                                }
                                                lineHeight="18px"
                                            >
                                                ↵
                                            </Box>
                                        </HStack>
                                    }
                                >
                                    Create
                                </Button>
                            </HStack>
                        </HStack>
                    </Flex>

                    {/* ── RIGHT PANEL ─────────────────────────────────────── */}
                    <Box
                        bg={rightBg}
                        position="relative"
                        display="flex"
                        flexDirection="column"
                        overflow="hidden"
                    >
                        {/* Header */}
                        <Box
                            px={12}
                            pt={16}
                            pb={5}
                            position="relative"
                            zIndex={1}
                        >
                            <Text
                                fontSize="11px"
                                fontWeight="700"
                                color="green.500"
                                letterSpacing="0.12em"
                                textTransform="uppercase"
                                mb={2}
                            >
                                {previewTitle}
                            </Text>
                            <Text
                                fontSize="14px"
                                color={labelColor}
                                lineHeight="1.6"
                                maxW="340px"
                            >
                                {previewDesc}
                            </Text>
                        </Box>

                        <Box
                            position="absolute"
                            top="120px"
                            left={0}
                            right={0}
                            h="48px"
                            style={{ background: rightTopGrad }}
                            pointerEvents="none"
                            zIndex={2}
                        />

                        <Box flex={1} position="relative" overflow="hidden">
                            <Box position="absolute" inset={0}>
                                <WorkflowPreview
                                    key={selectedTemplate?.id ?? "blank"}
                                    height="100%"
                                    nodes={previewNodes}
                                    edges={previewEdges}
                                    zoom={0.65}
                                    padding={0.3}
                                    border={false}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </ModalContent>
        </Modal>
    );
};
