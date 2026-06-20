import { Handle, Position } from "@xyflow/react";
import {
    Box,
    Text,
    Flex,
    VStack,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import type { AppNodeData, WorkflowNodeProps } from "../../../types/app-node";
import { Cpu, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BoxIcon from "../../BoxIcon" 

const ModelCard = ({
    label,
    settingLabel,
    isSelected,
    onCardClick,
}: {
    label: string;
    settingLabel?: string;
    isSelected: boolean;
    onCardClick: () => void;
}) => {
    const bg = useColorModeValue("white", "grey.800");
    const bgHover = useColorModeValue("green.50", "grey.700");
    const borderColor = useColorModeValue("green.200", "grey.700");
    const borderActive = useColorModeValue("green.400", "green.500");
    const accentBg = useColorModeValue("green.50", "green.900");
    const accentColor = useColorModeValue("green.500", "green.300");
    const labelColor = useColorModeValue("grey.800", "grey.100");
    const subColor = useColorModeValue("grey.500", "grey.400");
    const arrowColor = useColorModeValue("green.300", "green.500");

    return (
        <Box
            onClick={onCardClick}
            cursor="pointer"
            bg={bg}
            border="1px solid"
            borderColor={isSelected ? borderActive : borderColor}
            borderRadius="12px"
            minW="160px"
            maxW="220px"
            overflow="hidden"
            transition="all 0.15s"
            boxShadow={
                isSelected
                    ? "0 0 0 2px #34D3A9, 0 4px 12px rgba(139,92,246,0.12)"
                    : "0 2px 8px rgba(0,0,0,0.06)"
            }
            _hover={{ bg: bgHover, borderColor: borderActive }}
        >
            <Box
                h="3px"
                style={{ background: "linear-gradient(to right, #34D3A9, #07966F)" }}
                borderTopRadius="12px"
            />

            <Flex align="center" gap={3} px={3} py={3}>
                <BoxIcon icon={Cpu} color={accentColor} bg={accentBg} size="sm" />

                <VStack align="start" spacing={0} flex={1} minW={0}>
                    {settingLabel && (
                        <Text
                            fontSize="9px"
                            fontWeight={700}
                            letterSpacing="0.07em"
                            textTransform="uppercase"
                            color={accentColor}
                            lineHeight={1}
                            mb="2px"
                        >
                            Modèle d'IA
                        </Text>
                    )}
                    <Text
                        fontSize="sm"
                        fontWeight={600}
                        color={labelColor}
                        noOfLines={1}
                    >
                        {label}
                    </Text>
                    <Text fontSize="10px" color={subColor}>
                        Cliquer pour modifier
                    </Text>
                </VStack>

                <Icon
                    as={ChevronRight}
                    boxSize={4}
                    color={arrowColor}
                    flexShrink={0}
                />
            </Flex>
        </Box>
    );
};

const ModelPlaceholder = ({
    onClick,
    isHighlighted,
}: {
    onClick: (e: React.MouseEvent) => void;
    isHighlighted?: boolean;
}) => {
    const borderColor = useColorModeValue(
        isHighlighted ? "#EF4444" : "#A8F3DF",
        isHighlighted ? "#DC2626" : "#5D5D5D",
    );
    const bgHover = useColorModeValue(
        isHighlighted ? "#FEE2E2" : "#ECFDF9",
        isHighlighted ? "#3D0F0F" : "#4F4F4F",
    );
    const bg = useColorModeValue(
        "#FFFFFF",
        "#3D3D3D",
    );
    const iconColor = useColorModeValue(
        isHighlighted ? "#EF4444" : "#34D3A9",
        isHighlighted ? "#F87171" : "#34D3A9",
    );
    const textColor = useColorModeValue(
        isHighlighted ? "#991B1B" : "#6D6D6D",
        isHighlighted ? "#FCA5A5" : "#8F8F8F",
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
            <Icon as={Cpu} boxSize={4} color={iconColor} />
            <Text fontSize="10px" color={textColor} fontWeight={500} textAlign="center">
                Choisir un modèle IA
            </Text>
        </Flex>
    );
};

export const ModelNode = ({ id, data, selected, onNodeClick }: WorkflowNodeProps) => {
    const nodeData = data as AppNodeData;
    const isPlaceholder = nodeData.isPlaceholder;
    const displayLabel = nodeData.modelName ?? "Model";

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onNodeClick?.(id);
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
                    backgroundColor: "#8b5cf6",
                    border: "2px solid #E7E7E7",
                    width: "8px",
                    height: "8px",
                }}
            />

            <AnimatePresence mode="wait">
                {isPlaceholder ? (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                    >
                        <ModelPlaceholder onClick={handleClick} isHighlighted={nodeData.isHighlighted as boolean | undefined} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="card"
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <ModelCard
                            label={displayLabel}
                            settingLabel={nodeData.settingLabel}
                            isSelected={selected}
                            onCardClick={() => onNodeClick?.(id)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default ModelNode;
