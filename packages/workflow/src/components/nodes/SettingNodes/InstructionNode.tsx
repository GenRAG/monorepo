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
import { Terminal, MoreHorizontal, Info, Plus, FileText, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TabId = "rediger" | "apercu";

const TABS: { id: TabId; label: string }[] = [
    { id: "rediger", label: "Rédiger" },
    { id: "apercu", label: "Aperçu" },
];

// ── Validated state: compact read card (unchanged from original) ─────────────

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
    const bg = useColorModeValue("#FFFFFF", "#3D3D3D");
    const bgHover = useColorModeValue("#ECFDF9", "#464646");
    const borderColor = useColorModeValue("#A8F3DF", "#4F4F4F");
    const borderActive = useColorModeValue("#34D3A9", "#12B98C");
    const textColor = useColorModeValue("#3D3D3D", "#E7E7E7");
    const subColor = useColorModeValue("#6D6D6D", "#8F8F8F");
    const iconBg = useColorModeValue("#ECFDF9", "#4F4F4F");
    const iconColor = useColorModeValue("#12B98C", "#34D3A9");
    const editBg = useColorModeValue("#E7E7E7", "#4F4F4F");
    const editColor = useColorModeValue("#6D6D6D", "#8F8F8F");
    const headerBorder = useColorModeValue("#D1FAEF", "#4F4F4F");
    const editHoverBg = useColorModeValue("#D1D1D1", "#5D5D5D");

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
                    _hover={{ bg: editHoverBg }}
                    onClick={onEditClick}
                />
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
    nodeData,
    selected,
    draft,
    setDraft,
    onValidate,
    onCancel,
    onCardClick,
}: {
    nodeData: AppNodeData;
    selected?: boolean;
    draft: string;
    setDraft: (v: string) => void;
    onValidate: (e: React.MouseEvent) => void;
    onCancel: () => void;
    onCardClick: () => void;
}) => {
    const [tab, setTab] = useState<TabId>("rediger");

    const cardBg = useColorModeValue("#FFFFFF", "#2E2E2E");
    const headerBg = useColorModeValue("#F6F6F6", "#262626");
    const borderColor = useColorModeValue("#E7E7E7", "#3D3D3D");
    const selectedBorder = "#12B98C";
    const iconContainerBg = useColorModeValue("#D1FAEF", "#064E3B");
    const iconColor = useColorModeValue("#07966F", "#12B98C");
    const titleColor = useColorModeValue("#262626", "#E7E7E7");
    const subtitleColor = useColorModeValue("#8F8F8F", "#6D6D6D");
    const moreButtonHover = useColorModeValue("#E7E7E7", "#4F4F4F");
    const tabActiveColor = useColorModeValue("#07966F", "#12B98C");
    const tabInactiveColor = useColorModeValue("#8F8F8F", "#6D6D6D");
    const contentColor = useColorModeValue("#3D3D3D", "#D1D1D1");
    const placeholderColor = useColorModeValue("#B0B0B0", "#4F4F4F");
    const footerBg = useColorModeValue("#F6F6F6", "#1E1E1E");
    const footerInfoColor = useColorModeValue("#8F8F8F", "#6D6D6D");
    const validateHoverBg = useColorModeValue("#ECFDF9", "#064E3B");

    const stringValue = nodeData.stringValue ?? "";

    return (
        <Box
            bg={cardBg}
            border="1.5px solid"
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
                <Flex
                    w="28px"
                    h="28px"
                    borderRadius="8px"
                    bg={iconContainerBg}
                    align="center"
                    justify="center"
                    flexShrink={0}
                >
                    <Icon as={Terminal} boxSize="13px" color={iconColor} />
                </Flex>

                <VStack align="start" spacing={0} flex={1} minW={0}>
                    <Text fontSize="12px" fontWeight={700} color={titleColor} lineHeight={1.3} noOfLines={1}>
                        {nodeData.settingLabel ?? "Prompt instruction"}
                    </Text>
                    <Text fontSize="10px" color={subtitleColor} lineHeight={1.3}>
                        Nœud · paramètre
                    </Text>
                </VStack>

                <IconButton
                    aria-label="More options"
                    icon={<MoreHorizontal size={14} />}
                    size="xs"
                    variant="ghost"
                    color={subtitleColor}
                    minW="24px"
                    h="24px"
                    flexShrink={0}
                    _hover={{ bg: moreButtonHover }}
                    onClick={(e) => e.stopPropagation()}
                />
            </Flex>
            <HStack spacing={1} px={3} pt={2} pb="6px" borderBottom="1px solid" borderColor={borderColor}>
                {TABS.map((t) => {
                    const isActive = tab === t.id;
                    return (
                        <Button
                            key={t.id}
                            size="xs"
                            variant="outline"
                            colorScheme={isActive ? "green" : undefined}
                            onClick={(e) => {
                                e.stopPropagation();
                                setTab(t.id);
                            }}
                        >
                            {t.label}
                        </Button>
                    );
                })}
            </HStack>
            <Box minH="90px">
                {tab === "rediger" && (
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
                )}

                {tab === "apercu" && (
                    <Box p={3} minH="90px">
                        {stringValue ? (
                            <Text fontSize="12px" color={contentColor} lineHeight={1.7} whiteSpace="pre-wrap">
                                {stringValue}
                            </Text>
                        ) : (
                            <Text fontSize="12px" color={placeholderColor} fontStyle="italic">
                                Aucun contenu à prévisualiser.
                            </Text>
                        )}
                    </Box>
                )}
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
                        variant="outline"
                        colorScheme="green"
                        _hover={{ bg: validateHoverBg }}
                        onClick={onValidate}
                    >
                        Valider
                    </Button>
                </HStack>
            </Flex>
        </Box>
    );
};

export const InstructionNode = ({ id, data, selected, onNodeClick }: WorkflowNodeProps) => {
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

                {(nodeData.isEditing || (!isValidated && !nodeData.isPlaceholder)) && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <InstructionPanel
                            nodeData={nodeData}
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
