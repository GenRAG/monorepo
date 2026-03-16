import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Icon,
    IconButton,
    Textarea,
    Button,
    useColorModeValue,
} from "@chakra-ui/react";
import { FileText, Pencil, Check, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { AppNodeData } from "@genrag/workflow";

interface InstructionNodeProps {
    id: string;
    data: AppNodeData;
    selected: boolean;
    onNodeClick?: (nodeId: string) => void;
}

const InstructionCard = ({
    text,
    isSelected,
    onCardClick,
    onEditClick,
}: {
    text: string;
    isSelected: boolean;
    onCardClick: () => void;
    onEditClick: (e: React.MouseEvent) => void;
}) => {
    const bg = useColorModeValue("white", "grey.800");
    const bgHover = useColorModeValue("green.50", "grey.750");
    const borderColor = useColorModeValue("green.200", "grey.700");
    const borderActive = useColorModeValue("green.400", "green.500");
    const textColor = useColorModeValue("grey.800", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const iconBg = useColorModeValue("green.50", "grey.700");
    const iconColor = useColorModeValue("green.500", "green.400");
    const editBg = useColorModeValue("grey.100", "grey.700");
    const editColor = useColorModeValue("grey.500", "grey.400");

    return (
        <Box
            onClick={onCardClick}
            cursor="pointer"
            bg={bg}
            border="1px solid"
            borderColor={isSelected ? borderActive : borderColor}
            borderRadius="12px"
            minW="180px"
            maxW="240px"
            overflow="hidden"
            transition="all 0.15s"
            boxShadow={
                isSelected
                    ? "0 0 0 2px var(--chakra-colors-green-300), 0 4px 12px rgba(0,0,0,0.08)"
                    : "0 2px 8px rgba(0,0,0,0.06)"
            }
            _hover={{ bg: bgHover, borderColor: borderActive }}
        >
            <Flex
                align="center"
                justify="space-between"
                px={3}
                py={2}
                borderBottom="1px solid"
                borderColor={useColorModeValue("green.100", "grey.700")}
            >
                <HStack spacing={2}>
                    <Flex
                        w="22px"
                        h="22px"
                        borderRadius="6px"
                        bg={iconBg}
                        align="center"
                        justify="center"
                        flexShrink={0}
                    >
                        <Icon as={FileText} boxSize={3} color={iconColor} />
                    </Flex>
                    <Text
                        fontSize="10px"
                        fontWeight={700}
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                        color={subColor}
                    >
                        Instruction
                    </Text>
                </HStack>
                <IconButton
                    aria-label="Edit instruction"
                    icon={<Pencil size={11} />}
                    size="xs"
                    variant="ghost"
                    bg={editBg}
                    color={editColor}
                    h="20px"
                    minW="20px"
                    borderRadius="5px"
                    _hover={{ bg: useColorModeValue("grey.200", "grey.600") }}
                    onClick={onEditClick}
                />
            </Flex>
            <Box px={3} py={2}>
                <Text
                    fontSize="xs"
                    color={textColor}
                    lineHeight={1.6}
                    noOfLines={3}
                >
                    {text}
                </Text>
            </Box>
        </Box>
    );
};

const InstructionNode = ({
    id,
    data,
    selected,
    onNodeClick,
}: InstructionNodeProps) => {
    const { updateNodeData } = useReactFlow();
    const nodeData = data as AppNodeData;

    const stringValue = (nodeData.stringValue as string) || "";
    const isValidated = stringValue.trim().length > 0 && !nodeData.isEditing;
    const [draft, setDraft] = useState(stringValue);

    const handleValidate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!draft.trim()) return;
        updateNodeData(id, {
            stringValue: draft,
            isPlaceholder: false,
            isEditing: false,
        });
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDraft(stringValue);
        updateNodeData(id, { isEditing: true });
    };

    const handleCardClick = () => {
        onNodeClick?.(id);
    };

    const handleTextareaChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setDraft(e.target.value);
    };

    const bgTextarea = useColorModeValue("white", "grey.800");
    const borderColor = useColorModeValue("green.200", "grey.700");

    return (
        <Box
            className="drag-handle"
            cursor="grab"
            display="flex"
            flexDirection="column"
            alignItems="center"
            position="relative"
        >
            <Handle
                id="setting-target"
                type="target"
                position={Position.Left}
                style={{
                    background: "#34D3A9",
                    border: "none",
                    width: "1px",
                    height: "1px",
                    position: "absolute",
                    left: "-2px",
                }}
            />

            <AnimatePresence mode="wait">
                {nodeData.isPlaceholder &&
                    !nodeData.isEditing &&
                    !stringValue && (
                        <motion.div
                            key="plus"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                        >
                            <IconButton
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateNodeData(id, {
                                        isEditing: true,
                                        isPlaceholder: false,
                                    });
                                }}
                                size="xs"
                                aria-label="add instruction"
                                icon={<Plus size={12} />}
                            />
                        </motion.div>
                    )}

                {(nodeData.isEditing ||
                    (!isValidated && !nodeData.isPlaceholder)) && (
                    <motion.div
                        key="textarea"
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <VStack
                            spacing={0}
                            bg={bgTextarea}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="12px"
                            p={0}
                            w="220px"
                            boxShadow="0 4px 12px rgba(0,0,0,0.08)"
                        >
                            <Textarea
                                value={draft}
                                onChange={handleTextareaChange}
                                placeholder="Write your instruction…"
                                size="sm"
                                minH="80px"
                                maxH="160px"
                                resize="vertical"
                                borderColor="green.300"
                                borderTopRadius="8px"
                                fontSize="xs"
                                _focus={{
                                    borderColor: "green.400",
                                    boxShadow:
                                        "0 0 0 1px var(--chakra-colors-green-400)",
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <HStack w="100%" spacing={2}>
                                <Button
                                    w="100%"
                                    size="xs"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateNodeData(id, {
                                            isEditing: false,
                                            isPlaceholder: !stringValue.trim(),
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    borderRadius="0px"
                                    borderBottomRightRadius="12px"
                                    h="100%"
                                    w="100%"
                                    size="xs"
                                    colorScheme="green"
                                    leftIcon={<Check size={11} />}
                                    isDisabled={!draft.trim()}
                                    onClick={handleValidate}
                                >
                                    Save
                                </Button>
                            </HStack>
                        </VStack>
                    </motion.div>
                )}

                {isValidated && !nodeData.isEditing && (
                    <motion.div
                        key="card"
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <InstructionCard
                            text={stringValue}
                            isSelected={selected}
                            onCardClick={handleCardClick}
                            onEditClick={handleEditClick}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default InstructionNode;
