import { Handle, Position } from "@xyflow/react";
import {
    Box,
    Text,
    Flex,
    VStack,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import { Cpu, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as WorkflowPackage from "@genrag/workflow";

import type { AppNodeData, Task } from "@genrag/workflow";
import { TaskType } from "@genrag/workflow";

const { TaskRegistry } = WorkflowPackage as any;

interface ModelNodeProps {
    id: string;
    data: AppNodeData;
    selected: boolean;
    onNodeClick?: (nodeId: string) => void;
}

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
    const bgHover = useColorModeValue("green.50", "grey.750");
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
                    ? "0 0 0 2px var(--chakra-colors-green-300), 0 4px 12px rgba(139,92,246,0.12)"
                    : "0 2px 8px rgba(0,0,0,0.06)"
            }
            _hover={{ bg: bgHover, borderColor: borderActive }}
        >
            <Box
                h="3px"
                bgGradient="linear(to-r, green.400, green.600)"
                borderTopRadius="12px"
            />

            <Flex align="center" gap={3} px={3} py={2}>
                <Flex
                    w="30px"
                    h="30px"
                    borderRadius="8px"
                    bg={accentBg}
                    border="1px solid"
                    borderColor={useColorModeValue("green.100", "green.800")}
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
    const borderColor = useColorModeValue("green.200", "grey.600");
    const bgHover = useColorModeValue("green.50", "grey.700");
    const iconColor = useColorModeValue("green.400", "green.400");
    const textColor = useColorModeValue("grey.500", "grey.400");

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

const ModelNode = ({ id, data, selected, onNodeClick }: ModelNodeProps) => {
    const nodeData = data as AppNodeData;
    const task = TaskRegistry[TaskType.MODEL] as Task;
    const isPlaceholder = nodeData.isPlaceholder;
    const displayLabel = (nodeData.modelName as string) || task.label;

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
                position={task.sourcePosition ?? Position.Left}
                style={{
                    backgroundColor: "#8b5cf6",
                    border: "2px solid #E7E7E7",
                    top:
                        task.sourcePosition === Position.Top
                            ? "-8px"
                            : undefined,
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
                            settingLabel={
                                nodeData.settingLabel as string | undefined
                            }
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
