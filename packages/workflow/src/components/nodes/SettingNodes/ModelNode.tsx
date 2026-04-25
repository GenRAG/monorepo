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
    const bg = useColorModeValue("#FFFFFF", "#3D3D3D");
    const bgHover = useColorModeValue("#ECFDF9", "#464646");
    const borderColor = useColorModeValue("#A8F3DF", "#4F4F4F");
    const borderActive = useColorModeValue("#34D3A9", "#12B98C");
    const accentBg = useColorModeValue("#ECFDF9", "#064E3B");
    const accentBorder = useColorModeValue("#D1FAEF", "#076048");
    const accentColor = useColorModeValue("#12B98C", "#6EE7C7");
    const labelColor = useColorModeValue("#3D3D3D", "#E7E7E7");
    const subColor = useColorModeValue("#6D6D6D", "#8F8F8F");
    const arrowColor = useColorModeValue("#6EE7C7", "#12B98C");

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

            <Flex align="center" gap={3} px={3} py={2}>
                <Flex
                    w="30px"
                    h="30px"
                    borderRadius="8px"
                    bg={accentBg}
                    border="1px solid"
                    borderColor={accentBorder}
                    align="center"
                    justify="center"
                    flexShrink={0}
                >
                    <Icon as={Cpu} boxSize={4} color={accentColor} />
                </Flex>

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
                            {settingLabel}
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
                        Click to configure
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
}: {
    onClick: (e: React.MouseEvent) => void;
}) => {
    const borderColor = useColorModeValue("#A8F3DF", "#5D5D5D");
    const bgHover = useColorModeValue("#ECFDF9", "#4F4F4F");
    const bg = useColorModeValue("#FFFFFF", "#3D3D3D");
    const iconColor = useColorModeValue("#34D3A9", "#34D3A9");
    const textColor = useColorModeValue("#6D6D6D", "#8F8F8F");

    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            gap={1}
            w="70px"
            h="52px"
            border="1.5px dashed"
            borderColor={borderColor}
            bg={bg}
            borderRadius="10px"
            cursor="pointer"
            transition="all 0.15s"
            _hover={{ bg: bgHover, borderColor: iconColor }}
            onClick={onClick}
        >
            <Icon as={Cpu} boxSize={4} color={iconColor} />
            <Text fontSize="10px" color={textColor} fontWeight={500}>
                Add model
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
                        <ModelPlaceholder onClick={handleClick} />
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
