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
import type { AppNodeData, WorkflowNodeProps } from "../../../types/app-node";
import { Terminal, Info, FileText, Pencil } from "lucide-react";
import BoxIcon from "../../BoxIcon";
import { motion, AnimatePresence } from "framer-motion";

const InstructionPlaceholder = ({
    onClick,
    isHighlighted,
}: {
    onClick: (e: React.MouseEvent) => void;
    isHighlighted?: boolean;
}) => {
    const borderColor = useColorModeValue(
        isHighlighted ? "red.500" : "green.200",
        isHighlighted ? "red.600" : "grey.600",
    );
    const bgHover = useColorModeValue(
        isHighlighted ? "red.100" : "green.50",
        isHighlighted ? "red.950" : "grey.700",
    );
    const bg = useColorModeValue(
        "white", "grey.800",
    );
    const iconColor = useColorModeValue(
        isHighlighted ? "red.500" : "green.400",
        isHighlighted ? "red.400" : "green.400",
    );
    const textColor = useColorModeValue(
        isHighlighted ? "red.800" : "grey.500",
        isHighlighted ? "red.300" : "grey.400",
    );

    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            gap={1}
            w="120px"
            h="52px"
            border="2px dashed"
            borderColor={borderColor}
            bg={bg}
            borderRadius="10px"
            cursor="pointer"
            transition="all 0.15s"
            _hover={{ bg: bgHover, borderColor: iconColor }}
            onClick={onClick}
        >
            <Icon as={FileText} boxSize={4} color={iconColor} />
            <Text fontSize="10px" color={textColor} fontWeight={500} textAlign="center">
                Ajouter des instructions
            </Text>
        </Flex>
    );
};

const InstructionCard = ({
    text,
    isSelected,
    onCardClick,
    onEditClick,
    settingLabel,
}: {
    text: string;
    isSelected: boolean;
    onCardClick: () => void;
    onEditClick: (e: React.MouseEvent) => void;
    settingLabel?: string;
}) => {
    const bg = useColorModeValue("white", "grey.800");
    const bgHover = useColorModeValue("green.50", "grey.700");
    const borderColor = useColorModeValue("green.200", "grey.700");
    const borderActive = useColorModeValue("green.400", "green.500");
    const textColor = useColorModeValue("grey.800", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const iconBg = useColorModeValue("green.50", "grey.700");
    const iconColor = useColorModeValue("green.500", "green.400");
    const editBg = useColorModeValue("grey.100", "grey.700");
    const editColor = useColorModeValue("grey.500", "grey.400");
    const headerBorder = useColorModeValue("green.100", "grey.700");
    const editHoverBg = useColorModeValue("grey.200", "grey.600");

    return (
        <Box
            bg={bg}
            border="1px solid"
            borderColor={isSelected ? borderActive : borderColor}
            borderRadius="12px"
            w="250px"
            overflow="hidden"
            transition="all 0.15s"
            boxShadow={
                isSelected
                    ? "0 0 0 2px #34D3A9, 0 4px 12px rgba(0,0,0,0.08)"
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
                borderColor={headerBorder}
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
                        {settingLabel ?? "Instruction"}
                    </Text>
                </HStack>
                <Button
                    aria-label="Edit instruction"
                    leftIcon={<Icon as={Pencil} boxSize={3} />}
                    size="xs"
                    variant="ghost"
                    bg={editBg}
                    color={editColor}
                    h="20px"
                    minW="20px"
                    borderRadius="5px"
                    _hover={{ bg: editHoverBg }}
                    onClick={onEditClick}
                    cursor="pointer"
                >
                    Modifier
                </Button>
            </Flex>
            <Box px={3} py={2}>
                <Text fontSize="xs" color={textColor} lineHeight={1.6} noOfLines={3}>
                    {text}
                </Text>
            </Box>
        </Box>
    );
};

const InstructionPanel = ({
    selected,
    draft,
    setDraft,
    onValidate,
    onCancel,
    onCardClick,
}: {
    selected?: boolean;
    draft: string;
    setDraft: (v: string) => void;
    onValidate: (e: React.MouseEvent) => void;
    onCancel: () => void;
    onCardClick: () => void;
}) => {
    const cardBg = useColorModeValue("white", "grey.850");
    const headerBg = useColorModeValue("grey.50", "grey.900");
    const borderColor = useColorModeValue("grey.100", "grey.800");
    const selectedBorder = "green.300";
    const iconContainerBg = useColorModeValue("green.100", "green.900");
    const iconColor = useColorModeValue("green.600", "green.500");
    const titleColor = useColorModeValue("grey.900", "grey.100");
    const subtitleColor = useColorModeValue("grey.400", "grey.500");
    const contentColor = useColorModeValue("grey.800", "grey.200");
    const placeholderColor = useColorModeValue("grey.300", "grey.700");
    const footerBg = useColorModeValue("grey.50", "grey.950");
    const footerInfoColor = useColorModeValue("grey.400", "grey.500");
    const validateHoverBg = useColorModeValue("green.50", "green.900");

    return (
        <Box
            bg={cardBg}
            border="2px solid"
            borderColor={selected ? selectedBorder : borderColor}
            borderRadius="14px"
            w="290px"
            overflow="hidden"
            boxShadow={
                selected
                    ? `0 0 0 3px ${selectedBorder}33, 0 4px 20px rgba(0,0,0,0.15)`
                    : "0 4px 20px rgba(0,0,0,0.12)"
            }
            onClick={onCardClick}
            cursor="default"
            transition="border-color 0.15s, box-shadow 0.15s"
        >
            <Flex
                align="center"
                px={3}
                py="10px"
                bg={headerBg}
                borderBottom="1px solid"
                borderColor={borderColor}
                gap={2}
            >
                <BoxIcon icon={Terminal} color={iconColor} bg={iconContainerBg} size="sm" />

                <VStack align="start" spacing={0} flex={1} minW={0}>
                    <Text fontSize="12px" fontWeight={700} color={titleColor} lineHeight={1.3} noOfLines={1}>
                        Instruction
                    </Text>
                    <Text fontSize="10px" color={subtitleColor} lineHeight={1.3}>
                        paramètre
                    </Text>
                </VStack>
            </Flex>
            <Box minH="90px">
                <Textarea
                    value={draft}
                    onChange={(e) => {
                        e.stopPropagation();
                        setDraft(e.target.value);
                    }}
                    placeholder="Écrivez votre instruction."
                    size="sm"
                    border="none"
                    borderRadius={0}
                    resize="none"
                    minH="90px"
                    maxH="220px"
                    fontSize="12px"
                    lineHeight={1.7}
                    color={contentColor}
                    bg="transparent"
                    _placeholder={{ color: placeholderColor, fontSize: "12px" }}
                    _focus={{ boxShadow: "none" }}
                    onClick={(e) => e.stopPropagation()}
                    p={3}
                />
            </Box>
            <Flex
                align="center"
                justify="space-between"
                px={3}
                py="8px"
                bg={footerBg}
                borderTop="1px solid"
                borderColor={borderColor}
            >
                <HStack spacing={1.5}>
                    <Icon as={Info} boxSize="11px" color={footerInfoColor} />
                    <Text fontSize="10px" color={footerInfoColor}>
                        Markdown supporté
                    </Text>
                </HStack>

                <HStack spacing={2}>
                    <Button
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCancel();
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        size="xs"
                        variant="superPrimary"
                        onClick={onValidate}
                    >
                        Valider
                    </Button>
                </HStack>
            </Flex>
        </Box>
    );
};

export const InstructionNode = ({ id, data, selected, onNodeClick, onInstructionSave }: WorkflowNodeProps) => {
    const { updateNodeData } = useReactFlow();
    const nodeData = data as AppNodeData;

    const stringValue = nodeData.stringValue ?? "";
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
        onInstructionSave?.(id);
    };

    const handleCancel = () => {
        updateNodeData(id, {
            isEditing: false,
            isPlaceholder: !stringValue.trim(),
        });
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDraft(stringValue);
        updateNodeData(id, { isEditing: true });
    };

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
                {nodeData.isPlaceholder && !nodeData.isEditing && !stringValue && (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                    >
                        <InstructionPlaceholder
                            isHighlighted={nodeData.isHighlighted as boolean | undefined}
                            onClick={(e) => {
                                e.stopPropagation();
                                updateNodeData(id, { isEditing: true, isPlaceholder: false });
                            }}
                        />
                    </motion.div>
                )}

                {(nodeData.isEditing || (!isValidated && !nodeData.isPlaceholder)) && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <InstructionPanel
                            selected={selected}
                            draft={draft}
                            setDraft={setDraft}
                            onValidate={handleValidate}
                            onCancel={handleCancel}
                            onCardClick={() => onNodeClick?.(id)}
                        />
                    </motion.div>
                )}

                {isValidated && (
                    <motion.div
                        key="card"
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <InstructionCard
                            text={stringValue}
                            isSelected={!!selected}
                            onCardClick={() => onNodeClick?.(id)}
                            onEditClick={handleEditClick}
                            settingLabel={nodeData.settingLabel}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default InstructionNode;
